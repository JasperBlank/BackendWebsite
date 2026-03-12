from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import query, ingest, trends, alerts

app = FastAPI(title="Hearo API", version="1.0.0", description="Product intelligence via RAG")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://yourhearo.netlify.app",
        "https://jasperblank.com",
        "https://www.jasperblank.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router, prefix="/api/v1", tags=["query"])
app.include_router(ingest.router, prefix="/api/v1", tags=["ingest"])
app.include_router(trends.router, prefix="/api/v1", tags=["trends"])
app.include_router(alerts.router, prefix="/api/v1", tags=["alerts"])


@app.on_event("startup")
async def startup_seed():
    """Auto-seed sample data if the vector store is empty (e.g. Render cold start)."""
    from backend.embedding.vectorstore import collection_count
    if collection_count("notion") == 0:
        print("[Startup] No data found — seeding sample posts...")
        from scripts.seed_data import NOTION_POSTS
        from backend.ingestion.pipeline import ingest_posts
        ingest_posts(NOTION_POSTS, "notion")
        print(f"[Startup] Seeded {len(NOTION_POSTS)} posts for 'notion'")


@app.get("/health")
async def health():
    return {"status": "ok"}
