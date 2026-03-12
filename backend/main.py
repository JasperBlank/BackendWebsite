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
    """Auto-seed sample data if the vector store is empty (e.g. Render cold start).
    Uses batched ingestion to stay under Render's 512MB free-tier limit."""
    import gc
    from backend.embedding.vectorstore import collection_count
    from scripts.seed_data import ALL_PRODUCTS
    from backend.ingestion.pipeline import ingest_posts

    MAX_SEED = 8  # Limit per product to control peak memory

    for product_name, posts in ALL_PRODUCTS.items():
        if collection_count(product_name) == 0:
            trimmed = posts[:MAX_SEED]
            print(f"[Startup] Seeding {len(trimmed)} posts for '{product_name}'...")
            # Batch in groups of 4 to limit peak memory
            for i in range(0, len(trimmed), 4):
                ingest_posts(trimmed[i:i+4], product_name)
                gc.collect()
            print(f"[Startup] Seeded '{product_name}'")


@app.get("/health")
async def health():
    return {"status": "ok"}
