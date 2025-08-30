#!/usr/bin/env python3

import requests
import json

def test_candidates_api():
    """Test the candidates API endpoint"""
    try:
        response = requests.get('http://localhost:8000/api/candidates/')
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Response contains {len(data.get('results', []))} candidates")
            print(f"Response keys: {list(data.keys())}")
        else:
            print(f"Error Response: {response.text[:500]}")
            
    except requests.exceptions.ConnectionError:
        print("Connection Error: Could not connect to the backend")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_candidates_api()
