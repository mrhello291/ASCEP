#!/usr/bin/env python3
"""
ASCEP API Gateway Service
Module entry point for the API Gateway service
"""

import os
import sys
import traceback

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

print("🔍 Starting API Gateway with debug...")
print(f"Current working directory: {os.getcwd()}")
print(f"Service directory: {service_dir}")

# Check environment variables
print("\n📋 Environment variables:")
redis_url = os.getenv('REDIS_URL')
redis_host = os.getenv('REDISHOST')
redis_port = os.getenv('REDISPORT')
print(f"REDIS_URL: {redis_url[:50] + '...' if redis_url and len(redis_url) > 50 else redis_url}")
print(f"REDIS_HOST: {redis_host}")
print(f"REDIS_PORT: {redis_port}")

try:
    print("\n1️⃣ Testing imports...")
    from api_gateway import app, socketio
    print("✅ API Gateway import successful")
except Exception as e:
    print(f"❌ API Gateway import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)
    
    print("🚀 Starting ASCEP API Gateway Service...")
    print("🌐 Service will be available at: http://localhost:5000")
    
    try:
        socketio.run(app, host='0.0.0.0', port=5000, debug=False)
    except Exception as e:
        print(f"❌ API Gateway startup failed: {e}")
        traceback.print_exc()
        sys.exit(1) 