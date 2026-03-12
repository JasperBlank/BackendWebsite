from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Complaint(BaseModel):
    topic: str
    mention_count: int
    percentage: float          # % of retrieved posts mentioning this
    sentiment_score: float     # -1.0 to 1.0
    example_quote: str


class KeyFinding(BaseModel):
    finding: str
    supporting_sources: list[str]    # list of post URLs (validated post-generation)
    source_label: str                # e.g. "r/Notion · 217 mentions"


class SourceBreakdown(BaseModel):
    source: str                      # "reddit" | "appstore" | "hackernews"
    post_count: int
    icon: str                        # same as source, used by frontend


class QueryResponse(BaseModel):
    query: str
    product: str
    overall_sentiment_positive_pct: float
    total_posts_analyzed: int
    time_range_days: int
    top_complaints: list[Complaint]
    key_findings: list[KeyFinding]
    sources: list[SourceBreakdown]
    generated_at: datetime


class QueryRequest(BaseModel):
    query: str
    product: str
    days: int = 90
