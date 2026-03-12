"""
Legacy embedder module — kept for reference.
Embedding is now handled by ChromaDB's built-in DefaultEmbeddingFunction
(ONNX-based all-MiniLM-L6-v2), which uses ~80MB RAM instead of ~400MB+ with PyTorch.
"""
