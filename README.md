# Hearo — Product Intelligence via RAG

A RAG-based platform that turns public conversations — Reddit, App Store reviews, Hacker News — into cited, structured product intelligence. Ask plain-language questions about any product and get ranked insights, sentiment scores, and findings backed by real sources.

![Demo](https://jasperblank.com/hearo/)

## Features

- **Competitive intelligence** — ranked complaint maps from user-generated content
- **Feature demand tracking** — surface what users actually request, at scale
- **Sentiment trends** — track reputation over time with spike detection
- **Cited answers** — every finding links to a real source, no hallucinations

## Tech Stack

- **Backend**: FastAPI, Python, Anthropic Claude (tool use for structured output)
- **Vector store**: Chroma (local-first, Pinecone-ready)
- **Embeddings**: sentence-transformers `all-MiniLM-L6-v2` (free, local)
- **Retrieval**: MMR (Maximal Marginal Relevance) for diverse results
- **Data sources**: Reddit (PRAW), Hacker News API, App Store scraper
- **Frontend**: React, Vite, Tailwind CSS, Zustand

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/JasperBlank/hearo.git
cd hearo
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example backend/.env
```

```env
ANTHROPIC_API_KEY=sk-ant-...        # Required — get one at console.anthropic.com
REDDIT_CLIENT_ID=...                # Optional — for live Reddit ingestion
REDDIT_CLIENT_SECRET=...            # Optional — for live Reddit ingestion
REDDIT_USER_AGENT=hearo/1.0
CHROMA_PERSIST_DIR=./chroma_db
CLAUDE_MODEL=claude-sonnet-4-6
```

### 3. Seed demo data (no Reddit API needed)

```bash
cd ..
python -m scripts.seed_data notion
```

### 4. Start the backend

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/query` | Run a plain-language query against indexed data |
| `POST` | `/api/v1/ingest/trigger` | Trigger data ingestion for a product |
| `GET` | `/api/v1/ingest/status/{product}` | Check how many chunks are indexed |
| `GET` | `/api/v1/trends?product=notion` | Get weekly sentiment trend data |

### Example query

```bash
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the biggest complaints about Notions onboarding?", "product": "notion"}'
```

## How It Works

```
User query
  → embed query (sentence-transformers)
  → retrieve top-40 chunks from Chroma (MMR for diversity)
  → build grounded prompt with source URLs injected
  → Claude returns structured JSON via tool use
  → citation validator removes any hallucinated URLs
  → structured QueryResponse returned to frontend
```

Every URL in the findings is validated against the actual retrieved chunks — making hallucinated citations structurally impossible.

## Adding a New Product

1. Add it to `ingestion/reddit.py` → `PRODUCT_SUBREDDITS`
2. Add it to `ingestion/appstore.py` → `APP_STORE_IDS`
3. Trigger ingestion: `POST /api/v1/ingest/trigger {"product": "linear"}`

## Live Demo

A static demo (mock data, no backend required) is available at [jasperblank.com/hearo](https://jasperblank.com/hearo/)

## License

MIT
