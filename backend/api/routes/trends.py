from datetime import datetime, timedelta, timezone
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TrendPoint(BaseModel):
    date: str
    sentiment_positive_pct: float
    post_count: int


class TrendsResponse(BaseModel):
    product: str
    metric: str
    data: list[TrendPoint]


@router.get("/trends", response_model=TrendsResponse)
async def get_trends(product: str, days: int = 90):
    """Compute weekly sentiment trends from stored chunk metadata."""
    from backend.embedding.vectorstore import get_collection

    try:
        collection = get_collection(product)
        result = collection.get(include=["metadatas"])
        metas = result.get("metadatas") or []
    except Exception:
        return TrendsResponse(product=product, metric="sentiment", data=[])

    # Group by week
    from collections import defaultdict
    weekly: dict[str, list[float]] = defaultdict(list)

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    for meta in metas:
        created_str = meta.get("created_at", "")
        if not created_str:
            continue
        try:
            created = datetime.fromisoformat(created_str)
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        if created < cutoff:
            continue
        # Week bucket
        week_start = (created - timedelta(days=created.weekday())).strftime("%Y-%m-%d")
        weekly[week_start].append(meta.get("sentiment_score", 0.0))

    data = []
    for week, scores in sorted(weekly.items()):
        positive = sum(1 for s in scores if s > 0.1)
        data.append(TrendPoint(
            date=week,
            sentiment_positive_pct=round(positive / len(scores) * 100, 1),
            post_count=len(scores),
        ))

    return TrendsResponse(product=product, metric="sentiment", data=data)
