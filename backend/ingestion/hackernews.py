import hashlib
from datetime import datetime, timezone

import requests

from backend.ingestion.base import BaseFetcher
from backend.models.post import Post

HN_SEARCH = "https://hn.algolia.com/api/v1/search"
HN_ITEM = "https://hacker-news.firebaseio.com/v0/item/{id}.json"


def _make_id(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:16]


class HNFetcher(BaseFetcher):
    def fetch(self, product: str, limit: int = 100) -> list[Post]:
        posts: list[Post] = []
        try:
            resp = requests.get(HN_SEARCH, params={
                "query": product,
                "tags": "story",
                "hitsPerPage": limit,
            }, timeout=10)
            resp.raise_for_status()
            hits = resp.json().get("hits", [])
        except Exception as e:
            print(f"[HN] Search failed: {e}")
            return []

        for hit in hits:
            story_id = hit.get("objectID")
            url = hit.get("url") or f"https://news.ycombinator.com/item?id={story_id}"
            hn_url = f"https://news.ycombinator.com/item?id={story_id}"
            created_ts = hit.get("created_at_i", 0)
            post = Post(
                id=_make_id(hn_url),
                source="hackernews",
                product=product,
                url=hn_url,
                title=hit.get("title", ""),
                body=hit.get("story_text") or hit.get("title", ""),
                author=hit.get("author", ""),
                score=hit.get("points", 0),
                created_at=datetime.fromtimestamp(created_ts, tz=timezone.utc),
            )
            posts.append(post)

            # Fetch comments
            try:
                item_resp = requests.get(HN_ITEM.format(id=story_id), timeout=5)
                item_resp.raise_for_status()
                item = item_resp.json()
                for kid_id in (item.get("kids") or [])[:6]:
                    comment = self._fetch_comment(kid_id, product, hn_url)
                    if comment:
                        posts.append(comment)
            except Exception:
                pass

        return posts

    def _fetch_comment(self, comment_id: int, product: str, thread_url: str) -> Post | None:
        try:
            resp = requests.get(HN_ITEM.format(id=comment_id), timeout=5)
            resp.raise_for_status()
            item = resp.json()
            text = item.get("text", "")
            if not text or len(text) < 30 or item.get("dead") or item.get("deleted"):
                return None
            return Post(
                id=_make_id(f"hn_comment_{comment_id}"),
                source="hackernews",
                product=product,
                url=thread_url,
                title=f"HN comment in {thread_url}",
                body=text,
                author=item.get("by", ""),
                score=0,
                created_at=datetime.fromtimestamp(item.get("time", 0), tz=timezone.utc),
            )
        except Exception:
            return None
