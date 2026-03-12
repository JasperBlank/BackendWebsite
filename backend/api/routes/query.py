from fastapi import APIRouter, HTTPException
from backend.rag.schemas import QueryRequest, QueryResponse
from backend.rag.retriever import retrieve
from backend.rag.synthesizer import synthesize
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
