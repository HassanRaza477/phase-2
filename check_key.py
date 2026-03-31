import os
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

def check_key(api_key, label):
    base_url = "https://openrouter.ai/api/v1"
    print(f"\nChecking {label}: {api_key[:15]}...")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Todo AI App"
    }
    try:
        response = requests.get(f"{base_url}/auth/key", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Key 1 from root .env
    check_key("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", "ROOT_KEY")
    # Key 2 from backend .env
    check_key("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", "BACKEND_KEY")
