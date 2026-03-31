import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_login():
    print("Testing Login...")
    payload = {
        "email": "test@example.com",
        "password": "Password123!"
    }
    response = requests.post(f"{BASE_URL}/login", json=payload)
    if response.status_code == 200:
        data = response.json()
        print("Login successful.")
        return data["data"]["access_token"]
    print(f"Login failed: {response.text}")
    return None

def test_chat(token):
    print("\nTesting Chat with valid key...")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"message": "List my tasks please"}
    response = requests.post(f"{BASE_URL}/chat", json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    token = test_login()
    if token:
        test_chat(token)
