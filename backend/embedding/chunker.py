import re
from backend.models.post import Post, Chunk
import hashlib


def _split_sentences(text: str) -> list[str]:
    # Simple sentence splitter — avoids NLTK download requirement
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]


def chunk_post(post: Post, max_tokens: int = 350) -> list[Chunk]:
    """Split a post body into overlapping sentence-aware chunks."""
    sentences = _split_sentences(post.body)
    if not sentences:
        return []

    chunks: list[Chunk] = []
    current: list[str] = []
    current_len = 0

    for i, sentence in enumerate(sentences):
        word_count = len(sentence.split())
        if current_len + word_count > max_tokens and current:
            chunk_text = " ".join(current)
            chunk_id = hashlib.sha256(f"{post.id}:{len(chunks)}".encode()).hexdigest()[:16]
            chunks.append(Chunk(
                id=chunk_id,
                post_id=post.id,
                text=chunk_text,
                metadata={
                    "post_id": post.id,
                    "source": post.source,
                    "product": post.product,
                    "url": post.url,
                    "title": post.title,
                    "author": post.author,
                    "score": post.score,
                    "created_at": post.created_at.isoformat(),
                    "subreddit": post.subreddit or "",
                    "sentiment_score": post.sentiment_score,
                }
            ))
            # Overlap: keep last sentence
            current = [current[-1]] if current else []
            current_len = len(current[0].split()) if current else 0

        current.append(sentence)
        current_len += word_count

    # Final chunk
    if current:
        chunk_text = " ".join(current)
        chunk_id = hashlib.sha256(f"{post.id}:{len(chunks)}".encode()).hexdigest()[:16]
        chunks.append(Chunk(
            id=chunk_id,
            post_id=post.id,
            text=chunk_text,
            metadata={
                "post_id": post.id,
                "source": post.source,
                "product": post.product,
                "url": post.url,
                "title": post.title,
                "author": post.author,
                "score": post.score,
                "created_at": post.created_at.isoformat(),
                "subreddit": post.subreddit or "",
                "sentiment_score": post.sentiment_score,
            }
        ))

    return chunks
