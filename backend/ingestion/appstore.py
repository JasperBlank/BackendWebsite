import hashlib
from datetime import datetime, timezone

from backend.ingestion.base import BaseFetcher
from backend.models.post import Post

# App Store IDs for common products
APP_STORE_IDS: dict[str, tuple[str, str]] = {
    "notion": ("notion", "1232780281"),
    "linear": ("linear", "1445099521"),
    "figma": ("figma", "1152753200"),
    "slack": ("slack", "618783545"),
    "github": ("github", "1477376905"),
}


def _make_id(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:16]


def _rating_to_sentiment(rating: int) -> float:
    return (rating - 3) / 2.0


class AppStoreFetcher(BaseFetcher):
    def fetch(self, product: str, limit: int = 200) -> list[Post]:
        if product.lower() not in APP_STORE_IDS:
            print(f"[AppStore] No app ID configured for '{product}'")
            return []

        app_name, app_id = APP_STORE_IDS[product.lower()]
        try:
            from app_store_scraper import AppStore
            app = AppStore(country="us", app_name=app_name, app_id=app_id)
            app.review(how_many=limit)
            reviews = app.reviews
        except ImportError:
            print("[AppStore] app-store-scraper not installed, skipping.")
            return []
        except Exception as e:
            print(f"[AppStore] Failed to fetch reviews: {e}")
            return []

        posts: list[Post] = []
        for review in reviews:
            url = f"https://apps.apple.com/us/app/{app_name}/id{app_id}"
            uid = _make_id(f"{app_id}_{review.get('id', review.get('date', ''))}")
            rating = review.get("rating", 3)
            body = review.get("review", "")
            title = review.get("title", "")
            if not body:
                continue
            posts.append(Post(
                id=uid,
                source="appstore",
                product=product,
                url=url,
                title=title,
                body=f"{title}. {body}".strip() if title else body,
                author=review.get("userName", ""),
                score=rating,
                created_at=review.get("date", datetime.now(timezone.utc)),
                app_id=app_id,
                sentiment_score=_rating_to_sentiment(rating),
            ))

        return posts
