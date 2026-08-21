import requests
import json
import time

def test_chat():
    time.sleep(2) # Wait for server to boot
    url = "http://localhost:8000/api/assistant/chat"
    payload = {
        "domain": "bookcrossing",
        "user_profile": {"user_id": "test_user", "history": []},
        "message": "recommend me a popular book"
    }
    try:
        response = requests.post(url, json=payload, timeout=30)
        print("Status Code:", response.status_code)
        print("Response JSON:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_chat()
