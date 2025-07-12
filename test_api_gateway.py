#!/usr/bin/env python3
"""
Simple test script to verify API Gateway functionality
"""

import os
import sys
import time
import requests

def test_api_gateway():
    """Test if API Gateway is running and responding"""
    print("🧪 Testing API Gateway...")
    
    # Wait a bit for the service to start
    time.sleep(5)
    
    try:
        # Test basic connectivity
        response = requests.get('http://localhost:5000/', timeout=10)
        print(f"✅ API Gateway responded with status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        # Test health endpoint
        response = requests.get('http://localhost:5000/api/health', timeout=10)
        print(f"✅ Health endpoint responded with status: {response.status_code}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API Gateway")
        return False
    except Exception as e:
        print(f"❌ Error testing API Gateway: {e}")
        return False

if __name__ == '__main__':
    success = test_api_gateway()
    sys.exit(0 if success else 1) 