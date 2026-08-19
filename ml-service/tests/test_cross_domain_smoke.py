import pytest
from app.models.schemas import UserProfile, Constraints, RecommendationResponse, ComparisonTable
from app.domains.retailrocket_service import RetailrocketService
from app.domains.steam_service import SteamService
from app.domains.bookcrossing_service import BookCrossingService
from app.contracts.recommender import BaseRecommenderService

@pytest.fixture
def services():
    return {
        "retailrocket": RetailrocketService(),
        "steam": SteamService(),
        "bookcrossing": BookCrossingService()
    }

def test_interface_compliance(services):
    pass
        
        
def test_get_recommendations_smoke(services):
    user = UserProfile(user_id="SMOKE_TEST_USER")
    constraints = Constraints()
    
    for domain, service in services.items():
        result = service.get_recommendations(user, constraints)
        assert isinstance(result, RecommendationResponse)
        assert len(result.items) > 0
        for item in result.items:
            assert item.domain == domain
            assert hasattr(item, "item_id")
            assert hasattr(item, "score")
            
def test_compare_smoke(services):
    for domain, service in services.items():
        # Get some real items to compare from the baseline
        base_resp = service.get_recommendations(UserProfile(user_id="TEST"), Constraints())
        if not base_resp.items:
            continue
            
        item_ids = [base_resp.items[0].item_id]
        if len(base_resp.items) > 1:
            item_ids.append(base_resp.items[1].item_id)
            
        compare_result = service.compare(item_ids)
        assert isinstance(compare_result, ComparisonTable)
        assert len(compare_result.items) == len(item_ids)
        
        for item in compare_result.items:
            # Check for domain-specific fields that shouldn't be dropped
            assert "item_id" in item
            if domain == "bookcrossing":
                assert "title" in item
                assert "author" in item
            elif domain == "steam":
                assert "title" in item

def test_cold_start_smoke(services):
    for domain, service in services.items():
        base_resp = service.get_recommendations(UserProfile(user_id="TEST"), Constraints())
        if not base_resp.items:
            continue
            
        session_items = [base_resp.items[0].item_id]
        
        result = service.cold_start_recommend({"session_items": session_items})
        assert isinstance(result, RecommendationResponse)
        assert len(result.items) > 0
        
def test_explain_smoke(services):
    user = UserProfile(user_id="SMOKE_TEST_USER")
    for domain, service in services.items():
        base_resp = service.get_recommendations(user, Constraints())
        if not base_resp.items:
            continue
            
        item_id = base_resp.items[0].item_id
        explanation = service.explain(item_id, user)
        assert isinstance(explanation, str)
        assert len(explanation) > 0
