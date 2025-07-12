#!/usr/bin/env python3
"""
Test script to check if all required modules can be imported
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

print("Testing imports...")

try:
    print("1. Testing basic imports...")
    import redis
    import requests
    import flask
    print("✅ Basic imports successful")
except Exception as e:
    print(f"❌ Basic imports failed: {e}")
    sys.exit(1)

try:
    print("2. Testing service registry...")
    from backend.services.api_gateway.service_registry import service_registry
    print("✅ Service registry import successful")
except Exception as e:
    print(f"❌ Service registry import failed: {e}")
    sys.exit(1)

try:
    print("3. Testing latency monitor...")
    from backend.services.api_gateway.latency_monitor import LatencyMonitor
    print("✅ Latency monitor import successful")
except Exception as e:
    print(f"❌ Latency monitor import failed: {e}")
    sys.exit(1)

try:
    print("4. Testing API Gateway main module...")
    from backend.services.api_gateway.api_gateway import app, socketio
    print("✅ API Gateway import successful")
except Exception as e:
    print(f"❌ API Gateway import failed: {e}")
    sys.exit(1)

print("✅ All imports successful!") 