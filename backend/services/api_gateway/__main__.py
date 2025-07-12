#!/usr/bin/env python3
"""
ASCEP API Gateway Service
Module entry point for the API Gateway service
"""

import os
import sys
import traceback
import logging

# Configure logging to show everything
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

print("=" * 80)
print("🔍 STARTING API GATEWAY WITH COMPREHENSIVE DEBUG")
print("=" * 80)
print(f"Current working directory: {os.getcwd()}")
print(f"Service directory: {service_dir}")
print(f"Python path: {sys.path[:3]}...")

# Check environment variable
print("\n📋 ENVIRONMENT VARIABLES:")
redis_url = os.getenv('REDIS_URL')
redis_host = os.getenv('REDISHOST')
redis_port = os.getenv('REDISPORT')
print(f"REDIS_URL: {redis_url[:50] + '...' if redis_url and len(redis_url) > 50 else redis_url}")
print(f"REDIS_HOST: {redis_host}")
print(f"REDIS_PORT: {redis_port}")
print(f"PORT: {os.getenv('PORT')}")
print(f"PYTHONPATH: {os.getenv('PYTHONPATH')}")

# List files in directory
print("\n📁 FILES IN SERVICE DIRECTORY:")
try:
    files = os.listdir(service_dir)
    for file in files:
        print(f"  - {file}")
except Exception as e:
    print(f"❌ Error listing files: {e}")

try:
    print("\n1️⃣ TESTING IMPORTS...")
    
    # Test basic dependencies first
    print("Testing Flask...")
    import Flask
    print("✅ Flask imported successfully")
    
    print("Testing Flask-SocketIO...")
    import flask_socketio
    print("✅ Flask-SocketIO imported successfully")
    
    print("Testing Redis...")
    import redis
    print("✅ Redis imported successfully")
    
    print("Importing service_registry...")
    from service_registry import service_registry
    print("✅ service_registry imported successfully")
    
    print("Importing latency_monitor...")
    from latency_monitor import LatencyMonitor
    print("✅ latency_monitor imported successfully")
    
    print("Importing api_gateway...")
    from api_gateway import app, socketio
    print("✅ API Gateway import successful")
    
except Exception as e:
    print(f"❌ IMPORT FAILED: {e}")
    print("Full traceback:")
    traceback.print_exc()
    sys.exit(1)

if __name__ == '__main__':
    print("\n🚀 STARTING ASCEP API GATEWAY SERVICE...")
    print("🌐 Service will be available at: http://localhost:5000")
    
    try:
        socketio.run(app, host='0.0.0.0', port=5000, debug=False)
    except Exception as e:
        print(f"❌ API GATEWAY STARTUP FAILED: {e}")
        print("Full traceback:")
        traceback.print_exc()
        sys.exit(1) 