import asyncio
from httpx import AsyncClient, ASGITransport
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml-service")))
from app.main import app
import subprocess
import json

from app.db.database import connect_to_mongo, close_mongo_connection

async def run_demo():
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "ml-service", ".env"))
    await connect_to_mongo()
    
    print("--- 1. Logging 15 synthetic interactions ---")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        for i in range(15):
            payload = {
                "user_id": "DEMO_USER_1",
                "session_id": "DEMO_SESSION_1",
                "item_id": f"synthetic_item_{i%5}", # User interacts with 5 distinct items multiple times
                "domain": "retailrocket",
                "event_type": "view" if i < 14 else "purchase"
            }
            resp = await ac.post("/api/interactions/log", json=payload)
            if resp.status_code != 200:
                print(f"Error logging: {resp.text}")
                sys.exit(1)
                
    print("Logged 15 synthetic interactions for DEMO_USER_1.\n")
    
    print("--- 2. Before Retraining Evaluation ---")
    result = subprocess.run([sys.executable, "scripts/evaluate_retailrocket.py"], capture_output=True, text=True)
    before_output = result.stdout
    print("Before metrics extracted from output:")
    for line in before_output.split('\n'):
        if "Recall@10" in line or "ALS" in line:
            print(line.strip())
            
    print("\n--- 3. Running Retrain Script ---")
    retrain_result = subprocess.run([sys.executable, "scripts/retrain_domain.py", "retailrocket"], capture_output=True, text=True)
    if retrain_result.returncode != 0:
        print(f"Retraining failed:\n{retrain_result.stderr}")
        sys.exit(1)
    print("Retraining completed successfully.\n")
    
    print("--- 4. Checking manifest.json and Artifacts ---")
    with open("manifest.json", "r") as f:
        manifest = json.load(f)
        
    print("Current manifest 'retailrocket' entry:")
    print(json.dumps(manifest.get("retailrocket", {}), indent=2))
    
    print("\nOld versions preserved in manifest:")
    for k in manifest.keys():
        if k.startswith("retailrocket_"):
            print(k)
            
    current_model_file = manifest.get("retailrocket", {}).get("model_file")
    if current_model_file and os.path.exists(current_model_file):
        print(f"\nSUCCESS: New model file {current_model_file} exists on disk.")
    else:
        print(f"\nERROR: New model file {current_model_file} not found!")
        
    if os.path.exists("models/retailrocket_als.pkl"):
        print("SUCCESS: Original model file 'models/retailrocket_als.pkl' still exists (rollback safety).")
        
    print("\n--- 5. After Retraining Evaluation ---")
    result_after = subprocess.run([sys.executable, "scripts/evaluate_retailrocket.py"], capture_output=True, text=True)
    after_output = result_after.stdout
    print("After metrics extracted from output:")
    for line in after_output.split('\n'):
        if "Recall@10" in line or "ALS" in line:
            print(line.strip())

if __name__ == "__main__":
    asyncio.run(run_demo())
