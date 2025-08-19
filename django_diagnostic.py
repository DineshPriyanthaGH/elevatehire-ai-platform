"""
Complete Django URL and Method Diagnostic
"""

import urllib.request
import urllib.parse
import json

def test_get_request():
    """Test GET request (this should fail with 405 Method Not Allowed)"""
    try:
        response = urllib.request.urlopen("http://localhost:8000/api/auth/register/", timeout=5)
        data = response.read().decode('utf-8')
        print(f"❌ Unexpected: GET request succeeded")
        print(f"Response: {data[:100]}")
        return False
    except urllib.error.HTTPError as e:
        if e.code == 405:
            print(f"✅ Expected: GET request returns 405 Method Not Allowed")
            return True
        elif e.code == 404:
            print(f"❌ Problem: GET request returns 404 Not Found")
            return False
        else:
            print(f"❌ Unexpected HTTP error: {e.code}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def test_post_request():
    """Test POST request (this should work)"""
    url = "http://localhost:8000/api/auth/register/"
    data = {
        "username": "diagnostic_user",
        "email": "diagnostic@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Diagnostic",
        "last_name": "User"
    }
    
    try:
        json_data = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=json_data)
        req.add_header('Content-Type', 'application/json')
        
        response = urllib.request.urlopen(req, timeout=10)
        response_data = response.read().decode('utf-8')
        print(f"✅ POST request successful!")
        print(f"Status: {response.getcode()}")
        print(f"Response: {response_data[:150]}...")
        return True
        
    except urllib.error.HTTPError as e:
        print(f"❌ POST request failed: {e.code} - {e.reason}")
        try:
            error_data = e.read().decode('utf-8')
            print(f"Error response: {error_data[:200]}...")
        except:
            pass
        return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def test_base_api():
    """Test base API endpoint"""
    try:
        response = urllib.request.urlopen("http://localhost:8000/api/auth/", timeout=5)
        data = response.read().decode('utf-8')
        print(f"✅ Base API endpoint accessible")
        return True
    except Exception as e:
        print(f"❌ Base API endpoint failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 DJANGO URL AND METHOD DIAGNOSTIC")
    print("=" * 50)
    
    print("\n1. Testing base API endpoint:")
    base_ok = test_base_api()
    
    print("\n2. Testing GET request to register endpoint:")
    get_result = test_get_request()
    
    print("\n3. Testing POST request to register endpoint:")
    post_result = test_post_request()
    
    print("\n" + "=" * 50)
    print("📋 DIAGNOSIS:")
    
    if not base_ok:
        print("❌ CRITICAL: Backend server is not running or not accessible")
        print("   Run: docker-compose logs backend")
        
    elif get_result and post_result:
        print("✅ SUCCESS: All endpoints working correctly")
        print("   The 404 error you're seeing is likely due to:")
        print("   1. Using GET instead of POST method")
        print("   2. URL formatting issues (trailing newline)")
        
    elif get_result and not post_result:
        print("❌ PARTIAL: GET works but POST fails")
        print("   Check your JSON data and Content-Type header")
        
    elif not get_result and not post_result:
        print("❌ CRITICAL: Both GET and POST fail")
        print("   Check Django URL configuration")
    
    print("\n💡 POSTMAN CHECKLIST:")
    print("✅ Method: POST (not GET)")
    print("✅ URL: http://localhost:8000/api/auth/register/")
    print("✅ Headers: Content-Type: application/json")
    print("✅ Body: raw JSON format")
    print("✅ No trailing newlines in URL")
