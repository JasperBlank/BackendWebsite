FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Pre-cache the ONNX embedding model used by ChromaDB's DefaultEmbeddingFunction
RUN python -c "from chromadb.utils.embedding_functions import DefaultEmbeddingFunction; DefaultEmbeddingFunction()"

COPY backend/ ./backend/
COPY scripts/ ./scripts/
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
