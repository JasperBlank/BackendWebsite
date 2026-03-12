import hashlib
from datetime import datetime, timezone

import praw

from backend.config import settings
from backend.ingestion.base import BaseFetcher
from backend.models.post import Post

# Subreddits to search per product
PRODUCT_SUBREDDITS: dict[str, list[str]] = {
    "notion": ["notion", "productivity", "software", "selfhosted"],
    "linear": ["linear", "productivity", "agile", "softwareengineering"],
    "figma": ["figma", "design", "UXDesign", "webdev"],
    "slack": ["Slack", "productivity", "remotework"],
    "github": ["github", "programming", "devops", "softwareengineering"],
}


def _make_id(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:16]


def _sentiment_from_score(score: int) -> float:
    """Rough proxy: highly upvoted posts in complaint threads are more negative."""
    # Neutral default; real sentiment comes from pre-computed classifier
    return 0.0


class RedditFetcher(BaseFetcher):
    def __init__(self):
        self._reddit: praw.Reddit | None = None

    def _get_reddit(self) -> praw.Reddit:
        if self._reddit is None:
            self._reddit = praw.Reddit(
                client_id=settings.reddit_client_id,
                client_secret=settings.reddit_client_secret,
                user_agent=settings.reddit_user_agent,
                check_for_async=False,
            )
        return self._reddit

    def fetch(self, product: str, limit: int = 200) -> list[Post]:
        reddit = self._get_reddit()
        subreddits = PRODUCT_SUBREDDITS.get(product.lower(), [product])
        posts: list[Post] = []

        for sub_name in subreddits:
            try:
                sub = reddit.subreddit(sub_name)
                for submission in sub.search(product, limit=limit // len(subreddits), sort="relevance", time_filter="year"):
                    url = f"https://reddit.com{submission.permalink}"
                    post = Post(
                        id=_make_id(url),
                        source="reddit",
                        product=product,
                        url=url,
                        title=submission.title,
                        body=submission.selftext or submission.title,
                        author=str(submission.author) if submission.author else "[deleted]",
                        score=submission.score,
                        created_at=datetime.fromtimestamp(submission.created_utc, tz=timezone.utc),
                        subreddit=sub_name,
                    )
                    posts.append(post)

                    # Top comments carry the real signal
                    submission.comments.replace_more(limit=0)
                    for comment in list(submission.comments)[:8]:
                        if len(comment.body) < 20:
                            continue
                        comment_url = f"{url}{comment.id}"
                        posts.append(Post(
                            id=_make_id(comment_url),
                            source="reddit",
                            product=product,
                            url=url,  # link back to thread, not individual comment
                            title=f"Comment on: {submission.title}",
                            body=comment.body,
                            author=str(comment.author) if comment.author else "[deleted]",
                            score=comment.score,
                            created_at=datetime.fromtimestamp(comment.created_utc, tz=timezone.utc),
                            subreddit=sub_name,
                        ))
            except Exception as e:
                print(f"[Reddit] Error fetching r/{sub_name}: {e}")

        return posts
