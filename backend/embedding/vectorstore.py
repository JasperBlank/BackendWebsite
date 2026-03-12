import chromadb
from chromadb.config import Settings as ChromaSettings
from backend.config import settings
from backend.models.post import Chunk


_client: chromadb.ClientAPI | None = None


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
    )


def upsert_chunks(chunks: list[Chunk], product: str) -> int:
    """Upsert chunks into Chroma. Returns count upserted."""
    if not chunks:
        return 0

    # Filter out chunks without embeddings
    ready = [c for c in chunks if c.embedding is not None]
    if not ready:
        return 0

    collection = get_collection(product)
    collection.upsert(
        ids=[c.id for c in ready],
        embeddings=[c.embedding for c in ready],
        documents=[c.text for c in ready],
        metadatas=[c.metadata for c in ready],
    )
    return len(ready)


def query_collection(
    product: str,
    query_embedding: list[float],
    n_results: int = 40,
    days: int | None = None,
) -> list[dict]:
    """Retrieve top-n chunks. Returns list of dicts with text + metadata."""
    collection = get_collection(product)

    # Optional time filter (Chroma metadata filtering)
    where = None
    if days:
        from datetime import datetime, timedelta, timezone
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        where = {"created_at": {"$gte": cutoff}}

    try:
        result = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(n_results, collection.count()),
            where=where,
            include=["documents", "metadatas", "distances"],
        )
    except Exception:
        # Fallback without date filter if collection is small / filter fails
        result = collection.query(
            query_embeddings=[query_embedding],
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
