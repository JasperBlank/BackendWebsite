from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Post:
    id: str                          # sha256 of url
    source: str                      # "reddit" | "hackernews" | "appstore"
    product: str                     # e.g. "notion", "linear"
    url: str
    title: str
    body: str
    author: str
    score: int                       # upvotes, helpful_count, etc.
    created_at: datetime
    subreddit: Optional[str] = None  # Reddit only
    app_id: Optional[str] = None     # App Store only
    sentiment_score: float = 0.0     # -1.0 to 1.0, pre-computed at ingest


@dataclass
class Chunk:
    id: str            # post_id + chunk_index hash
    post_id: str
    text: str
    metadata: dict = field(default_factory=dict)
    embedding: Optional[list] = None
