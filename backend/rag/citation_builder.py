from backend.rag.schemas import QueryResponse


def validate_citations(response: QueryResponse, retrieved_chunks: list[dict]) -> QueryResponse:
    """Remove any URLs from findings that weren't actually in the retrieved context."""
    valid_urls = {chunk["metadata"].get("url", "") for chunk in retrieved_chunks}

    validated_findings = []
    for finding in response.key_findings:
        clean_sources = [url for url in finding.supporting_sources if url in valid_urls]
        validated_findings.append(finding.model_copy(update={"supporting_sources": clean_sources}))

    return response.model_copy(update={"key_findings": validated_findings})
