import pytest
from unittest.mock import patch
from app.domains.retailrocket_service import RetailrocketService
from app.models.schemas import UserProfile, Constraints, RecommendationResponse
from app.core.relaxation import relax_constraints_and_retry

@pytest.fixture
def service():
    return RetailrocketService()

def test_compare_no_fabricated_fields(service):
    result = service.compare(["item1", "item2"])
    assert len(result.items) == 2
    for item in result.items:
        assert item["title"] == "not specified"
        assert item["category"] == "not specified"
        assert item["price"] == "not specified"
        assert "popularity_score" in item

def test_compare_unknown_item_id(service):
    result = service.compare(["UNKNOWN_ITEM_XYZ"])
    assert len(result.items) == 1
    assert result.items[0]["item_id"] == "UNKNOWN_ITEM_XYZ"
    assert result.items[0]["popularity_score"] == 0
    assert result.items[0]["title"] == "not specified"

def test_cold_start_recommend_returns_baseline(service):
    # Empty session signal -> pure popularity fallback
    result = service.cold_start_recommend({"some_pref": "value"})
    assert len(result.items) > 0
    for item in result.items:
        assert "popularity baseline fallback" in item.similarity_basis

def test_cold_start_recommend_with_session_signal(service):
    if not service.model or not service.item_to_idx:
        pytest.skip("ALS model or item mappings not available.")
    
    known_item_id = next(iter(service.item_to_idx.keys()))
    
    result = service.cold_start_recommend({"session_items": [known_item_id]})
    assert len(result.items) > 0
    for item in result.items:
        assert "session-based co-occurrence" in item.similarity_basis
        assert item.item_id != known_item_id

def test_get_recommendations_fallback(service):
    user = UserProfile(user_id="UNKNOWN_USER_9999")
    constraints = Constraints()
    
    result = service.get_recommendations(user, constraints)
    assert len(result.items) > 0
    for item in result.items:
        assert "popularity baseline fallback" in item.similarity_basis

def test_get_recommendations_fallback_no_model():
    service = RetailrocketService()
    service.model = None 
    
    user = UserProfile(user_id="1")
    constraints = Constraints()
    
    result = service.get_recommendations(user, constraints)
    assert len(result.items) > 0
    for item in result.items:
        assert "popularity baseline fallback" in item.similarity_basis

def test_get_recommendations_als_flow(service):
    if not service.model or not service.user_to_idx:
        pytest.skip("ALS model or user mappings not available.")
        
    known_user_id = next(iter(service.user_to_idx.keys()))
    user = UserProfile(user_id=known_user_id)
    constraints = Constraints()
    
    result = service.get_recommendations(user, constraints)
    assert len(result.items) > 0
    for item in result.items:
        assert "collaborative filtering" in item.similarity_basis

def test_relaxation_utility(service):
    user = UserProfile(user_id="UNKNOWN_USER_9999")
    
    # We create a dummy fetch func that always returns empty if any constraint is set
    def dummy_fetch(c: Constraints) -> RecommendationResponse:
        if c.category or c.budget_max or c.tags:
            return RecommendationResponse(items=[])
        # If unconstrained, return a baseline
        return service.get_recommendations(user, c)
        
    constraints = Constraints(category="laptop", budget_max=1200, tags=["gaming"])
    
    response = relax_constraints_and_retry(dummy_fetch, constraints, target_count=10)
    
    # Should have relaxed tags, then budget, then category. When category was dropped, it succeeded.
    assert response.relaxed is True
    assert response.relaxed_constraint == "category"
    assert len(response.items) > 0
    for item in response.items:
        assert "relaxed: true, dropped category" in item.similarity_basis

def test_relaxation_all_exhausted():
    def dummy_fetch_fail(c: Constraints) -> RecommendationResponse:
        return RecommendationResponse(items=[])
        
    constraints = Constraints(category="laptop", budget_max=1200, tags=["gaming"])
    response = relax_constraints_and_retry(dummy_fetch_fail, constraints, target_count=10)
    
    assert response.relaxed is True
    assert response.relaxed_constraint == "all_exhausted"
        
def test_relaxation_partial_relax(service):
    user = UserProfile(user_id="UNKNOWN_USER_9999")
    
    # Dummy fetch func that returns results only if tags are dropped
    def dummy_fetch(c: Constraints) -> RecommendationResponse:
        if c.tags:
            return RecommendationResponse(items=[])
        # If tags are gone, return baseline
        return service.get_recommendations(user, c)
        
    constraints = Constraints(category="laptop", budget_max=1200, tags=["gaming"])
    
    response = relax_constraints_and_retry(dummy_fetch, constraints, target_count=10)
    
    # Should have relaxed ONLY tags
    assert response.relaxed is True
    assert response.relaxed_constraint == "tags"
    assert len(response.items) > 0
    for item in response.items:
        assert "relaxed: true, dropped tags" in item.similarity_basis

def test_requesting_more_than_domain_limit():
    # If a domain has fewer items than requested, we shouldn't error.
    # The baseline has ~8885 items. Let's request 100000.
    def dummy_fetch(c: Constraints) -> RecommendationResponse:
        service = RetailrocketService()
        return service._get_baseline_recommendations(100000)
        
    response = relax_constraints_and_retry(dummy_fetch, Constraints(), target_count=100000)
    assert len(response.items) > 0
    assert len(response.items) <= 8885
    # Since we didn't meet target_count and had no constraints to relax, it hits all_exhausted
    assert response.relaxed is True
    assert response.relaxed_constraint == "all_exhausted"
