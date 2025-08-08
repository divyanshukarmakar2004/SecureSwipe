# test_agent.py
import requests
import json
import time

# Base URL for the FastAPI server
BASE_URL = "http://localhost:8000"

def test_predict_endpoint():
    """Test the /predict endpoint"""
    print("="*60)
    print("TESTING /predict ENDPOINT")
    print("="*60)
    
    # Test cases
    test_cases = [
        {
            "name": "High Risk Transaction",
            "data": {
                "User": 1,
                "City": "Mumbai",
                "Year": 2025,
                "Month": 1,
                "Day": 15,
                "Time": "23:45",
                "Amount": 2000000.0
            }
        },
        {
            "name": "Normal Transaction",
            "data": {
                "User": 1,
                "City": "Mumbai",
                "Year": 2025,
                "Month": 1,
                "Day": 15,
                "Time": "14:30",
                "Amount": 500000.0
            }
        },
        {
            "name": "New User Transaction",
            "data": {
                "User": 999,
                "City": "Mumbai",
                "Year": 2025,
                "Month": 1,
                "Day": 15,
                "Time": "10:00",
                "Amount": 1000000.0
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n--- {test_case['name']} ---")
        print(f"Input: {test_case['data']}")
        
        try:
            response = requests.post(f"{BASE_URL}/predict", json=test_case['data'])
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success!")
                print(f"Prediction: {result['prediction']}")
                print(f"Risk Score: {result['risk_score']}")
                print(f"Mitigation: {result['mitigation']}")
                print(f"Pattern: {result['pattern']}")
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Exception: {e}")

def test_feedback_endpoint():
    """Test the /feedback endpoint"""
    print("\n" + "="*60)
    print("TESTING /feedback ENDPOINT")
    print("="*60)
    
    feedback_data = {
        "User": 1,
        "City": "Mumbai",
        "Year": 2025,
        "Month": 1,
        "Day": 15,
        "Time": "23:45",
        "Amount": 2000000.0,
        "Is_Fraud": "Yes"
    }
    
    print(f"Input: {feedback_data}")
    
    try:
        response = requests.post(f"{BASE_URL}/feedback", json=feedback_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            print(f"Message: {result['message']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_mitigation_feedback_endpoint():
    """Test the /mitigation_feedback endpoint"""
    print("\n" + "="*60)
    print("TESTING /mitigation_feedback ENDPOINT")
    print("="*60)
    
    mitigation_data = {
        "User": 1,
        "City": "Mumbai",
        "Year": 2025,
        "Month": 1,
        "Day": 15,
        "Time": "23:45",
        "Amount": 2000000.0,
        "Mitigation": "Freeze account for 24 hours",
        "Outcome": "Success"
    }
    
    print(f"Input: {mitigation_data}")
    
    try:
        response = requests.post(f"{BASE_URL}/mitigation_feedback", json=mitigation_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            print(f"Message: {result['message']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def check_server_status():
    """Check if the server is running"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ Server is running!")
            return True
        else:
            print("❌ Server is not responding properly")
            return False
    except Exception as e:
        print(f"❌ Server is not running: {e}")
        return False

def main():
    print("🧪 FRAUD MITIGATION ADVISOR AGENT TESTER")
    print("="*60)
    
    # Check if server is running
    if not check_server_status():
        print("\n🚨 Please start the server first:")
        print("python fraud_detection_system.py")
        return
    
    # Run tests
    test_predict_endpoint()
    test_feedback_endpoint()
    test_mitigation_feedback_endpoint()
    
    print("\n" + "="*60)
    print("🎉 ALL TESTS COMPLETED!")
    print("="*60)
    print("Check the generated CSV files:")
    print("- feedback_data.csv")
    print("- mitigation_feedback.csv")

if __name__ == "__main__":
    main()
