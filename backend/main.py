from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import query, ingest, trends, alerts

app = FastAPI(title="Hearo API", version="1.0.0", description="Product intelligence via RAG")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
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


@app.get("/health")
async def health():
    return {"status": "ok"}
