import os
from dotenv import load_dotenv
load_dotenv()

from app.llm.gemini_client import GeminiClient
from app.models.schemas import RankedItem, UserProfile, Constraints
from app.domains.retailrocket_service import RetailrocketService

def run_test():
    client = GeminiClient()
    rr_service = RetailrocketService()
    
    # We'll simulate a user who has viewed some items to trigger ALS recommendations.
    # We can just use dummy item IDs if the ALS model allows cold-starting or fallback,
    # or we can rely on the service's empty-history fallback (top popular).
    profile = UserProfile(
        user_id="demo_user",
        history=[] # Will trigger popular fallback, generating real RankedItems
    )
    
    constraints = Constraints() # Empty constraints
    
    print("Fetching real recommendations from RetailrocketService...")
    rec_response = rr_service.get_recommendations(profile, constraints)
    
    if not rec_response.items:
        print("No items returned from RetailrocketService!")
        return
        
    top_item = rec_response.items[0]
    
    print(f"\nReal Retailrocket RankedItem generated:")
    print(top_item.model_dump_json(indent=2))
    
    print("\nRequesting explanation from LLM...")
    explanation = client.explain_recommendation(top_item, profile)
    
    print("\n--- LLM Response ---")
    print(explanation)
    print("--------------------\n")
    print("Test finished.")

if __name__ == "__main__":
    run_test()
