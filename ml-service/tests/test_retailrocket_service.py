import pytest
import os
import json
from unittest.mock import patch
from app.domains.retailrocket_service import RetailrocketService
from app.models.schemas import UserProfile, Constraints

@pytest.fixture
def service():
    return RetailrocketService()

def test_compare_no_fabricated_fields(service):
    # Task 5: test compare() never returns a fabricated field
    result = service.compare(["item1", "item2"])
    
    assert len(result.items) == 2
    for item in result.items:
        assert item["title"] == "not specified"
        assert item["category"] == "not specified"
        assert item["price"] == "not specified"
        assert "popularity_score" in item

def test_cold_start_recommend_returns_baseline(service):
    # Task 5: test cold_start_recommend() returns non-empty results for a simulated new user
    result = service.cold_start_recommend({"some_pref": "value"})
    assert len(result) > 0
    for item in result:
        assert "popularity baseline fallback" in item.similarity_basis

def test_get_recommendations_fallback(service):
    # Task 5: test get_recommendations fallback flow when user is unknown
    user = UserProfile(user_id="UNKNOWN_USER_9999")
    constraints = Constraints()
    
    result = service.get_recommendations(user, constraints)
    assert len(result) > 0
    for item in result:
        assert "popularity baseline fallback" in item.similarity_basis
        
def test_get_recommendations_fallback_no_model():
    # Task 5: test get_recommendations fallback flow when ALS model is corrupted/missing
    # We temporarily mock the model to None
    service = RetailrocketService()
    service.model = None 
    
    user = UserProfile(user_id="1") # User ID doesn't matter since model is None
    constraints = Constraints()
    
    result = service.get_recommendations(user, constraints)
    assert len(result) > 0
    for item in result:
        assert "popularity baseline fallback" in item.similarity_basis

def test_get_recommendations_als_flow(service):
    # Standard flow
    if not service.model or not service.user_to_idx:
        pytest.skip("ALS model or user mappings not available.")
        
    known_user_id = next(iter(service.user_to_idx.keys()))
    user = UserProfile(user_id=known_user_id)
    constraints = Constraints()
    
    result = service.get_recommendations(user, constraints)
    assert len(result) > 0
    for item in result:
        assert "collaborative filtering" in item.similarity_basis
