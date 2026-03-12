from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env relative to this file (backend/.env)
_ENV_FILE = Path(__file__).parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), extra="ignore")

    anthropic_api_key: str = ""
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "hearo/1.0"

    # Embedding model — "local" uses sentence-transformers (free), "voyage" uses Voyage API
    embedding_model: str = "local"
    voyage_api_key: str = ""

    # Chroma persistence directory
    chroma_persist_dir: str = "./chroma_db"

    # Claude model
    claude_model: str = "claude-sonnet-4-6"

    # How many chunks to retrieve before MMR
    retrieval_k: int = 40
    # How many chunks to pass to Claude after MMR
    synthesis_k: int = 20


settings = Settings()
