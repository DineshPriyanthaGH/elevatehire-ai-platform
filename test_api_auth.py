import requests
import json

# Test authentication and API response structure
def test_api_with_auth():
    base_url = "http://localhost:8000"
    
    # Try to login to get auth token
    login_data = {
        "email_or_username": "admin@example.com",
        "password": "admin123"
    }
    
    try:
        # Login
        login_response = requests.post(f"{base_url}/api/auth/login/", json=login_data)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            if login_result.get('success'):
                access_token = login_result['tokens']['access']
                print("✅ Login successful")
                
                # Test interviews API with auth
                headers = {'Authorization': f'Bearer {access_token}'}
                
                # Test interviews endpoint
                interviews_response = requests.get(f"{base_url}/api/interviews/interviews/", headers=headers)
                print(f"Interviews API Status: {interviews_response.status_code}")
                
                if interviews_response.status_code == 200:
                    interviews_data = interviews_response.json()
                    print("✅ Interviews API working")
                    
                    if interviews_data.get('results'):
                        interview = interviews_data['results'][0]
                        print(f"Sample interview structure:")
                        print(f"- ID: {interview.get('id')}")
                        print(f"- Title: {interview.get('title')}")
                        
                        # Check candidate structure
                        candidate = interview.get('candidate')
                        if isinstance(candidate, dict):
                            print(f"✅ Candidate is nested object: {candidate.get('full_name')}")
                        else:
                            print(f"❌ Candidate is still ID: {candidate}")
                        
                        # Check interview_type structure
                        interview_type = interview.get('interview_type')
                        if isinstance(interview_type, dict):
                            print(f"✅ Interview type is nested object: {interview_type.get('name')}")
                        else:
                            print(f"❌ Interview type is still ID: {interview_type}")
                        
                        # Check interviewer structure
                        interviewer = interview.get('interviewer')
                        if isinstance(interviewer, dict):
                            print(f"✅ Interviewer is nested object: {interviewer.get('full_name')}")
                        else:
                            print(f"❌ Interviewer is still ID: {interviewer}")
                    
                    else:
                        print("No interviews found")
                
                # Test interviewers endpoint
                interviewers_response = requests.get(f"{base_url}/api/interviews/interviews/interviewers/", headers=headers)
                print(f"Interviewers API Status: {interviewers_response.status_code}")
                
                if interviewers_response.status_code == 200:
                    interviewers_data = interviewers_response.json()
                    print(f"✅ Interviewers API working - Found {len(interviewers_data)} interviewers")
                    if interviewers_data:
                        print(f"Sample interviewer: {interviewers_data[0].get('full_name', interviewers_data[0].get('username'))}")
                
                # Test interview types endpoint
                types_response = requests.get(f"{base_url}/api/interviews/interview-types/", headers=headers)
                print(f"Interview Types API Status: {types_response.status_code}")
                
                if types_response.status_code == 200:
                    types_data = types_response.json()
                    if isinstance(types_data, dict) and 'results' in types_data:
                        types_list = types_data['results']
                    else:
                        types_list = types_data
                    
                    print(f"✅ Interview Types API working - Found {len(types_list)} types")
                    if types_list:
                        print(f"Sample type: {types_list[0].get('name')}")
                
            else:
                print(f"❌ Login failed: {login_result}")
        else:
            print(f"❌ Login request failed: {login_response.status_code}")
            print(login_response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_api_with_auth()