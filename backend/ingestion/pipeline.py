"""
Full ingestion pipeline: fetch -> sentiment score -> chunk -> embed -> upsert
"""
from backend.models.post import Post, Chunk
from backend.embedding.chunker import chunk_post
from backend.embedding.embedder import embed_texts
from backend.embedding.vectorstore import upsert_chunks


def _score_sentiment(posts: list[Post]) -> list[Post]:
    """Assign sentiment scores. App Store posts already have scores from ratings.
    For text-based posts, use a simple heuristic based on negative word density."""
    NEGATIVE_WORDS = {
        "slow", "broken", "crash", "bug", "awful", "terrible", "frustrating",
        "annoying", "useless", "hate", "bad", "worse", "worst", "problem",
        "issue", "fail", "failed", "missing", "confusing", "complicated",
        "overwhelming", "expensive", "overpriced", "clunky", "laggy",
    }
    POSITIVE_WORDS = {
        "great", "love", "amazing", "excellent", "fantastic", "fast",
        "easy", "simple", "clean", "intuitive", "beautiful", "helpful",
        "perfect", "good", "best", "awesome", "wonderful", "efficient",
    }

    scored = []
    for post in posts:
        if post.sentiment_score != 0.0:
            # Already scored (e.g., App Store from rating)
            scored.append(post)
            continue
        words = set(post.body.lower().split())
        neg = len(words & NEGATIVE_WORDS)
        pos = len(words & POSITIVE_WORDS)
        total = neg + pos
        if total == 0:
            sentiment = 0.0
        else:
            sentiment = (pos - neg) / total
        post.sentiment_score = round(sentiment, 3)
        scored.append(post)

    return scored


def ingest_posts(posts: list[Post], product: str) -> dict:
    """Run the full ingestion pipeline for a list of posts."""
    if not posts:
        return {"posts": 0, "chunks": 0, "upserted": 0}

    # 1. Score sentiment
    posts = _score_sentiment(posts)

    # 2. Chunk
    all_chunks: list[Chunk] = []
    for post in posts:
        all_chunks.extend(chunk_post(post))

    if not all_chunks:
        return {"posts": len(posts), "chunks": 0, "upserted": 0}

    # 3. Embed (batch)
    texts = [c.text for c in all_chunks]
    embeddings = embed_texts(texts)
    for chunk, emb in zip(all_chunks, embeddings):
        chunk.embedding = emb

    # 4. Upsert to Chroma
    upserted = upsert_chunks(all_chunks, product)

    return {"posts": len(posts), "chunks": len(all_chunks), "upserted": upserted}
