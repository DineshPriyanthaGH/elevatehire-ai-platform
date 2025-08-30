#!/usr/bin/env python3

import requests
import json

def test_login_api():
    """Test the login API endpoint"""
    try:
        # Test data - you can replace with actual test credentials
        login_data = {
            "email_or_username": "test@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(
            'http://localhost:8000/api/auth/login/',
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Login API Status Code: {response.status_code}")
        
        if response.status_code in [200, 400, 401]:
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
            except:
                print(f"Response text: {response.text}")
        else:
            print(f"Unexpected status. Response: {response.text[:500]}")
            
    except requests.exceptions.ConnectionError:
        print("Connection Error: Could not connect to the backend")
    except Exception as e:
        print(f"Error: {e}")

def test_candidates_authenticated():
    """Test the candidates API with authentication"""
    try:
        # This will test without auth first to see the error
        response = requests.get('http://localhost:8000/api/candidates/')
        print(f"Candidates API (no auth) Status Code: {response.status_code}")
        
        if response.status_code != 200:
            try:
                data = response.json()
                print(f"Error Response: {json.dumps(data, indent=2)}")
            except:
                print(f"Response text: {response.text}")
        else:
            data = response.json()
            print(f"Success! Response contains {len(data.get('results', []))} candidates")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("=== Testing Login API ===")
    test_login_api()
    print("\n=== Testing Candidates API ===")
    test_candidates_authenticated()
