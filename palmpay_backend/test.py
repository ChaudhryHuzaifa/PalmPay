# complete_test.py
import requests
import base64
import cv2
import numpy as np
import time

class PalmPayTester:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.biometric_url = "http://localhost:8000"
        self.token = None
    
    def test_health(self):
        """Test health endpoints"""
        print("Testing health endpoints...")
        
        # Test backend
        try:
            resp = requests.get(f"{self.base_url}/api/v1/health", timeout=5)
            print(f"  Backend: ✅ {resp.status_code} - {resp.json().get('status')}")
        except:
            print("  Backend: ❌ Not responding")
        
        # Test biometric
        try:
            resp = requests.get(f"{self.biometric_url}/health", timeout=5)
            print(f"  Biometric: ✅ {resp.status_code} - {resp.json().get('status')}")
        except:
            print("  Biometric: ❌ Not responding")
    
    def test_auth(self):
        """Test authentication"""
        print("\nTesting authentication...")
        
        test_users = [
            {"phone": "1234567890", "pin": "1234", "name": "John Doe"},
            {"phone": "0987654321", "pin": "5678", "name": "Jane Smith"},
            {"phone": "5551234567", "pin": "9999", "name": "Alice Johnson"}
        ]
        
        for user in test_users:
            try:
                resp = requests.post(
                    f"{self.base_url}/api/v1/auth/login",
                    json={"phoneNumber": user["phone"], "pin": user["pin"]},
                    timeout=5
                )
                if resp.status_code == 200:
                    self.token = resp.json()["data"]["token"]
                    print(f"  {user['name']}: ✅ Login successful")
                    print(f"    Balance: ${resp.json()['data']['user']['balance']}")
                    return True
                else:
                    print(f"  {user['name']}: ❌ Login failed")
            except Exception as e:
                print(f"  {user['name']}: ❌ Error - {e}")
        
        return False
    
    def test_user_endpoints(self):
        """Test user-related endpoints"""
        if not self.token:
            print("No token available. Skipping user endpoints.")
            return
        
        print("\nTesting user endpoints...")
        
        endpoints = [
            ("GET /users/profile", f"{self.base_url}/api/v1/users/profile"),
            ("GET /transactions/balance", f"{self.base_url}/api/v1/transactions/balance"),
            ("GET /transactions/history", f"{self.base_url}/api/v1/transactions/history?limit=3"),
            ("GET /users/dashboard-stats", f"{self.base_url}/api/v1/users/dashboard-stats"),
        ]
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        for name, url in endpoints:
            try:
                resp = requests.get(url, headers=headers, timeout=5)
                if resp.status_code == 200:
                    print(f"  {name}: ✅ Success")
                else:
                    print(f"  {name}: ❌ Failed - {resp.status_code}")
            except Exception as e:
                print(f"  {name}: ❌ Error - {e}")
    
    def test_biometric_endpoints(self):
        """Test biometric endpoints"""
        if not self.token:
            print("No token available. Skipping biometric endpoints.")
            return
        
        print("\nTesting biometric endpoints...")
        
        # Create a mock image
        mock_image = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(mock_image, "Mock Palm Image", (50, 240), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        # Convert to base64
        _, buffer = cv2.imencode('.jpg', mock_image)
        base64_image = base64.b64encode(buffer).decode('utf-8')
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Test verify endpoint
        verify_data = {"palmImage": base64_image}
        try:
            resp = requests.post(
                f"{self.base_url}/api/v1/biometric/verify",
                json=verify_data,
                headers=headers,
                timeout=10
            )
            if resp.status_code == 200:
                result = resp.json()["data"]
                print(f"  POST /biometric/verify: ✅ Success")
                print(f"    Confidence: {result['confidence']}")
                print(f"    Decision: {result['decision']}")
            else:
                print(f"  POST /biometric/verify: ❌ Failed - {resp.status_code}")
        except Exception as e:
            print(f"  POST /biometric/verify: ❌ Error - {e}")
        
        # Test biometric service directly
        print("\nTesting biometric service directly...")
        
        # Test root endpoint
        try:
            resp = requests.get(f"{self.biometric_url}/", timeout=5)
            if resp.status_code == 200:
                print(f"  GET /: ✅ Success")
                print(f"    Service: {resp.json().get('service')}")
        except Exception as e:
            print(f"  GET /: ❌ Error - {e}")
        
        # Test register endpoint (mock)
        register_data = {
            "user_id": "test-user-123",
            "palm_images": [base64_image],
            "hand_side": "RIGHT"
        }
        
        try:
            resp = requests.post(
                f"{self.biometric_url}/biometric/register",
                json=register_data,
                timeout=10
            )
            if resp.status_code == 200:
                print(f"  POST /biometric/register: ✅ Success")
            else:
                print(f"  POST /biometric/register: ❌ Failed - {resp.status_code}")
        except Exception as e:
            print(f"  POST /biometric/register: ❌ Error - {e}")
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting PalmPay System Tests")
        print("=" * 60)
        
        # Test 1: Health
        self.test_health()
        
        # Test 2: Authentication
        if self.test_auth():
            # Test 3: User endpoints
            self.test_user_endpoints()
            
            # Test 4: Biometric endpoints
            self.test_biometric_endpoints()
        
        print("\n" + "=" * 60)
        print("🎉 All tests completed!")
        print("\n📊 System Status Summary:")
        print("   Backend API: http://localhost:3000")
        print("   Biometric Service: http://localhost:8000")
        print("   Test Credentials:")
        print("     Phone: 1234567890, PIN: 1234")
        print("     Phone: 0987654321, PIN: 5678")

if __name__ == "__main__":
    tester = PalmPayTester()
    tester.run_all_tests()