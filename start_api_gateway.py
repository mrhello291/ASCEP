#!/usr/bin/env python3
"""
Debug script to start API Gateway with better error handling
"""

import os
import sys
import traceback

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

print("🔍 Starting API Gateway debug mode...")
print(f"Current working directory: {os.getcwd()}")
print(f"Python path: {sys.path[:3]}...")

# Check environment variables
print("\n📋 Environment variables:")
redis_url = os.getenv('REDIS_URL')
redis_host = os.getenv('REDIS_HOST')
redis_port = os.getenv('REDIS_PORT')
print(f"REDIS_URL: {redis_url[:50] + '...' if redis_url and len(redis_url) > 50 else redis_url}")
print(f"REDIS_HOST: {redis_host}")
print(f"REDIS_PORT: {redis_port}")

try:
    print("\n1️⃣ Testing basic imports...")
    import redis
    import requests
    import flask
    from flask_cors import CORS
    from flask_socketio import SocketIO
    print("✅ Basic imports successful")
except Exception as e:
    print(f"❌ Basic imports failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n2️⃣ Testing service registry...")
    from backend.services.api_gateway.service_registry import service_registry
    print("✅ Service registry import successful")
except Exception as e:
    print(f"❌ Service registry import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n3️⃣ Testing latency monitor...")
    from backend.services.api_gateway.latency_monitor import LatencyMonitor
    print("✅ Latency monitor import successful")
except Exception as e:
    print(f"❌ Latency monitor import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n4️⃣ Testing API Gateway main module...")
    from backend.services.api_gateway.api_gateway import app, socketio
    print("✅ API Gateway import successful")
except Exception as e:
    print(f"❌ API Gateway import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n5️⃣ Testing Redis connection...")
    if redis_url:
        print(f"Connecting to Redis via URL...")
        redis_client = redis.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
    else:
        print(f"Connecting to Redis at {redis_host or 'localhost'}:{redis_port or 6379}")
        redis_client = redis.Redis(
            host=redis_host or 'localhost',
            port=int(redis_port or 6379),
            db=0,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
    
    redis_client.ping()
    print("✅ Redis connection successful")
except Exception as e:
    print(f"❌ Redis connection failed: {e}")
    print("⚠️ Continuing without Redis...")

print("\n🚀 Starting API Gateway...")
try:
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)
except Exception as e:
    print(f"❌ API Gateway startup failed: {e}")
    traceback.print_exc()
    sys.exit(1) 