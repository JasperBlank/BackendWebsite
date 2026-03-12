import math
from backend.embedding import embedder, vectorstore
from backend.config import settings


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def mmr_rerank(
    query_embedding: list[float],
    candidates: list[dict],
    k: int,
    lambda_mult: float = 0.5,
) -> list[dict]:
    """Maximal Marginal Relevance — balances relevance with diversity."""
    if not candidates:
        return []

    # Chroma returns distance (lower = more similar for cosine).
    # Convert to relevance score: relevance = 1 - distance
    for c in candidates:
        c["_relevance"] = 1.0 - c.get("distance", 0.0)

    selected = []
    remaining = list(candidates)

    while remaining and len(selected) < k:
        if not selected:
            # First pick: most relevant
            best = max(remaining, key=lambda x: x["_relevance"])
        else:
            # MMR score = lambda * relevance - (1-lambda) * max_similarity_to_selected
            # We approximate chunk embedding similarity via text overlap (no stored embeddings)
            # Using relevance score as proxy — sufficient for MVP
            def mmr_score(candidate):
                rel = candidate["_relevance"]
                # Penalise if very similar text to already selected chunks
                max_sim = 0.0
                cand_words = set(candidate["text"].lower().split())
                for sel in selected:
                    sel_words = set(sel["text"].lower().split())
                    union = cand_words | sel_words
                    if union:
                        jaccard = len(cand_words & sel_words) / len(union)
                        max_sim = max(max_sim, jaccard)
                return lambda_mult * rel - (1 - lambda_mult) * max_sim

            best = max(remaining, key=mmr_score)

        selected.append(best)
        remaining.remove(best)

    return selected


def retrieve(
    query: str,
    product: str,
    days: int = 90,
    k: int | None = None,
) -> list[dict]:
    """Full retrieval pipeline: embed -> fetch -> MMR rerank."""
    synthesis_k = k or settings.synthesis_k
    fetch_k = settings.retrieval_k

    query_emb = embedder.embed_query(query)
    candidates = vectorstore.query_collection(product, query_emb, n_results=fetch_k, days=days)

    if not candidates:
        return []

    return mmr_rerank(query_emb, candidates, k=synthesis_k)
