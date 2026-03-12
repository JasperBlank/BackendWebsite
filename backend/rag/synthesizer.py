import json
from collections import Counter
from datetime import datetime, timezone

import anthropic

from backend.config import settings
from backend.rag.schemas import (
    Complaint,
    KeyFinding,
    QueryResponse,
    QueryRequest,
    SourceBreakdown,
)
from backend.rag.citation_builder import validate_citations

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _client


# Tool schema that Claude must populate — forces structured, citable output
ANALYSIS_TOOL = {
    "name": "submit_analysis",
    "description": "Submit the structured product intelligence analysis.",
    "input_schema": {
        "type": "object",
        "required": ["top_complaints", "key_findings"],
        "properties": {
            "top_complaints": {
                "type": "array",
                "description": "Top complaint topics ranked by mention frequency",
                "items": {
                    "type": "object",
                    "required": ["topic", "mention_count", "percentage", "sentiment_score", "example_quote"],
                    "properties": {
                        "topic": {"type": "string", "description": "Short label for the complaint (e.g. 'Steep learning curve')"},
                        "mention_count": {"type": "integer", "description": "Number of posts/chunks that mention this topic"},
                        "percentage": {"type": "number", "description": "Percentage of retrieved posts that mention this (0-100)"},
                        "sentiment_score": {"type": "number", "description": "Average sentiment for this topic (-1.0 very negative to 1.0 very positive)"},
                        "example_quote": {"type": "string", "description": "A short verbatim quote from one of the posts illustrating this complaint"},
                    },
                },
            },
            "key_findings": {
                "type": "array",
                "description": "3-5 key insights, each with supporting source URLs",
                "items": {
                    "type": "object",
                    "required": ["finding", "supporting_sources", "source_label"],
                    "properties": {
                        "finding": {"type": "string", "description": "A single insight sentence"},
                        "supporting_sources": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of EXACT post URLs from the context that support this finding",
                        },
                        "source_label": {"type": "string", "description": "Human-readable source summary, e.g. 'r/notion · 47 posts'"},
                    },
                },
            },
        },
    },
}

SYSTEM_PROMPT = """You are a product intelligence analyst. Your job is to analyze user-generated posts \
about software products and extract structured insights about complaints, feature requests, and sentiment.

Rules:
- Only reference posts provided in the context. Never invent statistics.
- supporting_sources must be EXACT URLs copied from the [URL: ...] lines in the context.
- A complaint topic must appear in at least 2 posts to be listed.
- example_quote must be a short verbatim excerpt from an actual post.
- Rank complaints by mention_count descending.
- List 3-5 key findings that directly answer the user's question.
- sentiment_score: negative topics get -0.3 to -1.0, positive get 0.3 to 1.0.
- percentage: what fraction of the provided posts mention this topic (0-100).
"""


def _build_context(chunks: list[dict]) -> str:
    lines = []
    for i, chunk in enumerate(chunks, 1):
        meta = chunk["metadata"]
        source_label = meta.get("subreddit") or meta.get("source", "")
        if meta.get("subreddit"):
            source_label = f"r/{meta['subreddit']}"
        lines.append(
            f"[POST {i}]\n"
            f"Source: {meta.get('source', 'unknown')} {source_label}\n"
            f"URL: {meta.get('url', '')}\n"
            f"Score: {meta.get('score', 0)}\n"
            f"Date: {meta.get('created_at', '')[:10]}\n"
            f"Text: {chunk['text']}\n"
        )
    return "\n".join(lines)


def _compute_sentiment_pct(chunks: list[dict]) -> float:
    scores = [c["metadata"].get("sentiment_score", 0.0) for c in chunks]
    if not scores:
        return 50.0
    positive = sum(1 for s in scores if s > 0.1)
    return round(positive / len(scores) * 100, 1)


def _compute_source_breakdown(chunks: list[dict]) -> list[SourceBreakdown]:
    counter: Counter = Counter()
    for c in chunks:
        src = c["metadata"].get("source", "unknown")
        counter[src] += 1
    return [
        SourceBreakdown(source=src, post_count=count, icon=src)
        for src, count in counter.most_common()
    ]


def synthesize(request: QueryRequest, chunks: list[dict]) -> QueryResponse:
    """Run Claude synthesis over retrieved chunks and return a validated QueryResponse."""
    if not chunks:
        return QueryResponse(
            query=request.query,
            product=request.product,
            overall_sentiment_positive_pct=0.0,
            total_posts_analyzed=0,
            time_range_days=request.days,
            top_complaints=[],
            key_findings=[],
            sources=[],
            generated_at=datetime.now(timezone.utc),
        )

    context = _build_context(chunks)
    user_message = (
        f"Question: {request.query}\n\n"
        f"Analyze the following {len(chunks)} posts about '{request.product}':\n\n"
        f"{context}\n\n"
        f"Submit your analysis using the submit_analysis tool."
    )

    client = _get_client()
    response = client.messages.create(
        model=settings.claude_model,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
        tools=[ANALYSIS_TOOL],
        tool_choice={"type": "any"},
    )

    # Extract tool use result
    tool_result = None
    for block in response.content:
        if block.type == "tool_use" and block.name == "submit_analysis":
            tool_result = block.input
            break

    if not tool_result:
        raise ValueError("Claude did not call submit_analysis tool")

    complaints = [Complaint(**c) for c in tool_result.get("top_complaints", [])]
    findings = [KeyFinding(**f) for f in tool_result.get("key_findings", [])]
    sentiment_pct = _compute_sentiment_pct(chunks)
    source_breakdown = _compute_source_breakdown(chunks)

    result = QueryResponse(
        query=request.query,
        product=request.product,
        overall_sentiment_positive_pct=sentiment_pct,
        total_posts_analyzed=len(chunks),
        time_range_days=request.days,
        top_complaints=complaints,
        key_findings=findings,
        sources=source_breakdown,
        generated_at=datetime.now(timezone.utc),
    )

    return validate_citations(result, chunks)
