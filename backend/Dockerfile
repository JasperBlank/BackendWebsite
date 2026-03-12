FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY backend/ ./backend/
COPY scripts/ ./scripts/
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
