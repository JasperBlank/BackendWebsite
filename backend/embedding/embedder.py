from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

_model = None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a list of texts. Returns list of float vectors."""
    model = _get_model()
    embeddings = model.encode(texts, batch_size=64, show_progress_bar=False)
    return [e.tolist() for e in embeddings]


def embed_query(query: str) -> list[float]:
    return embed_texts([query])[0]
