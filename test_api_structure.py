#!/usr/bin/env python3
"""
Test script to check API structure and data serialization
"""
import requests
import json
from requests.auth import HTTPBasicAuth

# Test API structure without auth (should fail but show structure)
def test_api_structure():
    print("Testing API Structure...")
    
    # Test interviews endpoint
    url = "http://localhost:8000/api/interviews/interviews/"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("Authentication required (expected)")
            print("Response:", response.json())
        elif response.status_code == 200:
            print("Success! API Response:")
            data = response.json()
            print(json.dumps(data, indent=2))
        else:
            print(f"Unexpected status: {response.status_code}")
            print("Response:", response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

# Test with sample data creation
def test_with_django_admin():
    print("\nTesting Django admin interface...")
    
    # First, let's see if we can access admin
    admin_url = "http://localhost:8000/admin/"
    
    try:
        response = requests.get(admin_url)
        print(f"Admin Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Django admin is accessible")
        else:
            print("Admin access issue")
            
    except requests.exceptions.RequestException as e:
        print(f"Admin request failed: {e}")

if __name__ == "__main__":
    test_api_structure()
    test_with_django_admin()