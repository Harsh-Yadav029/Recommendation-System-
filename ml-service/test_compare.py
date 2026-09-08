import asyncio
import os
import sys

# Fix windows encoding issue
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.domains.bookcrossing_service import BookCrossingService
from app.llm.hybrid_client import HybridLLMClient

async def run():
    svc = BookCrossingService()
    # Hardcode the top 4 baseline items shown in the user's run to be perfectly exact
    item_ids = ['5403', '2058', '5566', '2565']
    
    print(f"Comparing items: {item_ids}")
    
    comp_table = svc.compare(item_ids)
    
    llm = HybridLLMClient()
    chat_response = llm.chat_about_comparison(comp_table.items)
    
    print("\n--- NEW LLM RESPONSE ---")
    print(chat_response)

if __name__ == "__main__":
    asyncio.run(run())
