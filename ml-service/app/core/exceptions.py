class LLMUnavailableException(Exception):
    """Raised when the LLM service is completely unavailable after all retries."""
    pass
