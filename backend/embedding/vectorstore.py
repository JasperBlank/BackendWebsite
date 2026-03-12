import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from backend.config import settings
from backend.models.post import Chunk


_client: chromadb.ClientAPI | None = None
_embed_fn: DefaultEmbeddingFunction | None = None


def _get_embed_fn() -> DefaultEmbeddingFunction:
    """Shared ONNX-based embedding function (all-MiniLM-L6-v2, ~80MB RAM)."""
    global _embed_fn
    if _embed_fn is None:
        _embed_fn = DefaultEmbeddingFunction()
    return _embed_fn


def get_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _client


def get_collection(product: str):
    client = get_client()
    name = f"hearo_{product.lower().replace(' ', '_')}"
    return client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},
        embedding_function=_get_embed_fn(),
    )


def upsert_chunks(chunks: list[Chunk], product: str) -> int:
    """Upsert chunks into Chroma. ChromaDB embeds documents automatically."""
    if not chunks:
        return 0

    collection = get_collection(product)
    collection.upsert(
        ids=[c.id for c in chunks],
        documents=[c.text for c in chunks],
        metadatas=[c.metadata for c in chunks],
    )
    return len(chunks)


def query_collection(
    product: str,
    query_text: str,
    n_results: int = 40,
    days: int | None = None,
) -> list[dict]:
    """Retrieve top-n chunks. ChromaDB embeds the query automatically."""
    collection = get_collection(product)

    # Optional time filter (Chroma metadata filtering)
    where = None
    if days:
        from datetime import datetime, timedelta, timezone
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        where = {"created_at": {"$gte": cutoff}}

    try:
        result = collection.query(
            query_texts=[query_text],
            n_results=min(n_results, collection.count()),
            where=where,
            include=["documents", "metadatas", "distances"],
        )
    except Exception:
        # Fallback without date filter if collection is small / filter fails
        result = collection.query(
            query_texts=[query_text],
            n_results=min(n_results, max(collection.count(), 1)),
            include=["documents", "metadatas", "distances"],
        )

    chunks = []
    if result["documents"] and result["documents"][0]:
        for doc, meta, dist in zip(
            result["documents"][0],
            result["metadatas"][0],
            result["distances"][0],
        ):
            chunks.append({"text": doc, "metadata": meta, "distance": dist})

    return chunks


def collection_count(product: str) -> int:
    try:
        return get_collection(product).count()
    except Exception:
        return 0
