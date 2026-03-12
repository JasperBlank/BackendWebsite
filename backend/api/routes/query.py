import asyncio
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from backend.rag.schemas import QueryRequest, QueryResponse
from backend.rag.retriever import retrieve
from backend.rag.synthesizer import synthesize, _compute_sentiment_pct, _compute_source_breakdown
from backend.embedding.vectorstore import collection_count

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def run_query(request: QueryRequest) -> QueryResponse:
    count = collection_count(request.product)
    if count == 0:
        raise HTTPException(
            status_code=422,
            detail=f"No data indexed for product '{request.product}'. "
                   f"Run /ingest/trigger first.",
        )

    chunks = retrieve(request.query, request.product, days=request.days)
    if not chunks:
        raise HTTPException(
            status_code=404,
            detail=f"No relevant posts found for product '{request.product}'.",
        )

    return synthesize(request, chunks)


@router.post("/query/stream")
async def run_query_stream(request: QueryRequest):
    """SSE streaming endpoint — sends progress events during analysis."""

    async def generate():
        def _sse(event: str, data: dict) -> str:
            return f"event: {event}\ndata: {json.dumps(data)}\n\n"

        # Step 1: Validate
        yield _sse("step", {"step": "validating", "message": "Checking indexed data..."})
        count = await asyncio.to_thread(collection_count, request.product)
        if count == 0:
            yield _sse("error", {"message": f"No data indexed for '{request.product}'."})
            return
        yield _sse("step", {"step": "validated", "message": f"Found {count} indexed chunks"})

        # Step 2: Retrieve
        yield _sse("step", {"step": "retrieving", "message": "Searching vector database..."})
        chunks = await asyncio.to_thread(retrieve, request.query, request.product, request.days)
        if not chunks:
            yield _sse("error", {"message": f"No relevant posts found for '{request.product}'."})
            return
        yield _sse("step", {"step": "retrieved", "message": f"Retrieved {len(chunks)} relevant posts"})

        # Step 3: Early results — sentiment + sources (instant, no LLM needed)
        sentiment_pct = _compute_sentiment_pct(chunks)
        sources = _compute_source_breakdown(chunks)
        yield _sse("partial", {
            "overall_sentiment_positive_pct": sentiment_pct,
            "total_posts_analyzed": len(chunks),
            "sources": [{"source": s.source, "post_count": s.post_count, "icon": s.icon} for s in sources],
        })

        # Step 4: Claude synthesis (slow part)
        yield _sse("step", {"step": "synthesizing", "message": "Claude is analyzing patterns..."})
        result = await asyncio.to_thread(synthesize, request, chunks)
        yield _sse("step", {"step": "done", "message": "Analysis complete"})

        # Step 5: Final result
        yield _sse("result", result.model_dump(mode="json"))

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
