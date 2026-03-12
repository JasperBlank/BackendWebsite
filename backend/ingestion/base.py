from abc import ABC, abstractmethod
from backend.models.post import Post


class BaseFetcher(ABC):
    @abstractmethod
    def fetch(self, product: str, limit: int = 200) -> list[Post]:
        """Fetch posts for a product. Returns normalized Post objects."""
        ...
