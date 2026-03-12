"""
Quick smoke test for the full RAG pipeline.
Run: python -m scripts.test_rag
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.stdout.reconfigure(encoding='utf-8')

from backend.rag.schemas import QueryRequest
from backend.rag.retriever import retrieve
from backend.rag.synthesizer import synthesize

query = QueryRequest(
    query="What are the biggest complaints about Notion's onboarding?",
    product="notion",
    days=90,
)

print(f"Query: {query.query}")
print("Retrieving chunks...")
chunks = retrieve(query.query, query.product, days=query.days)
print(f"Retrieved {len(chunks)} chunks")

if not chunks:
    print("ERROR: No chunks found. Run seed_data.py first.")
    sys.exit(1)

print("Synthesizing with Claude...")
result = synthesize(query, chunks)

print(f"\n=== RESULT ===")
print(f"Sentiment: {result.overall_sentiment_positive_pct}% positive")
print(f"Posts analyzed: {result.total_posts_analyzed}")
print(f"\nTop complaints:")
for c in result.top_complaints:
    print(f"  - {c.topic}: {c.mention_count} mentions ({c.percentage:.0f}%)")

print(f"\nKey findings:")
for i, f in enumerate(result.key_findings, 1):
    print(f"  {i}. {f.finding}")
    print(f"     [{f.source_label}]")
    for url in f.supporting_sources[:2]:
        print(f"     -> {url}")

print(f"\nSources:")
for s in result.sources:
    print(f"  {s.source}: {s.post_count} posts")
