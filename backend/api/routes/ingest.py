from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from backend.ingestion.pipeline import ingest_posts

router = APIRouter()

SUPPORTED_SOURCES = {"reddit", "hackernews", "appstore"}


class IngestRequest(BaseModel):
    product: str
    sources: list[str] = ["reddit", "hackernews"]
    limit: int = 200


class IngestResponse(BaseModel):
    product: str
    sources: list[str]
    status: str


def _run_ingestion(product: str, sources: list[str], limit: int):
    all_posts = []

    if "reddit" in sources:
        try:
            from backend.ingestion.reddit import RedditFetcher
            posts = RedditFetcher().fetch(product, limit=limit)
            all_posts.extend(posts)
            print(f"[Ingest] Reddit: {len(posts)} posts for '{product}'")
        except Exception as e:
            print(f"[Ingest] Reddit failed: {e}")

    if "hackernews" in sources:
        try:
            from backend.ingestion.hackernews import HNFetcher
            posts = HNFetcher().fetch(product, limit=limit // 2)
            all_posts.extend(posts)
            print(f"[Ingest] HN: {len(posts)} posts for '{product}'")
        except Exception as e:
            print(f"[Ingest] HN failed: {e}")

    if "appstore" in sources:
        try:
            from backend.ingestion.appstore import AppStoreFetcher
            posts = AppStoreFetcher().fetch(product, limit=limit)
            all_posts.extend(posts)
            print(f"[Ingest] AppStore: {len(posts)} reviews for '{product}'")
        except Exception as e:
            print(f"[Ingest] AppStore failed: {e}")

    result = ingest_posts(all_posts, product)
    print(f"[Ingest] Done: {result}")


@router.post("/ingest/trigger", response_model=IngestResponse)
async def trigger_ingest(request: IngestRequest, background: BackgroundTasks):
    valid = [s for s in request.sources if s in SUPPORTED_SOURCES]
    background.add_task(_run_ingestion, request.product, valid, request.limit)
    return IngestResponse(product=request.product, sources=valid, status="queued")


@router.post("/ingest/seed")
async def seed_data(background: BackgroundTasks):
    """Seed the vector store with sample data for demo purposes."""
    def _seed():
        from scripts.seed_data import NOTION_POSTS
        result = ingest_posts(NOTION_POSTS, "notion")
        print(f"[Seed] Done: {result}")
    background.add_task(_seed)
    return {"status": "seeding", "product": "notion"}


@router.get("/ingest/status/{product}")
async def ingest_status(product: str):
    from backend.embedding.vectorstore import collection_count
    count = collection_count(product)
    return {"product": product, "indexed_chunks": count}
