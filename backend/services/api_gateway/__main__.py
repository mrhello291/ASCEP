#!/usr/bin/env python3
"""
ASCEP API Gateway Service
Module entry point for the API Gateway service
"""

import os
import sys
import traceback

# Simple print-based logging for maximum visibility
print("=" * 80)
print("🚀 STARTING ASCEP API GATEWAY SERVICE")
print("=" * 80)
print(f"Current working directory: {os.getcwd()}")

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)
print(f"Service directory: {service_dir}")

# Check environment variables
print("\n📋 ENVIRONMENT VARIABLES:")
print(f"PORT: {os.getenv('PORT')}")
print(f"REDIS_URL: {'SET' if os.getenv('REDIS_URL') else 'NOT SET'}")
print(f"DEBUG: {os.getenv('DEBUG')}")

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
    from api_gateway import app, socketio, start_background_tasks
    print("✅ API Gateway import successful")
    
    print("\n🚀 STARTING ASCEP API GATEWAY SERVICE...")
    print("🌐 Service will be available at: http://0.0.0.0:5000")
    
    # Start background tasks
    print("🔄 Starting background tasks...")
    start_background_tasks()
    print("✅ Background tasks started")
    
    # Start the application
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("Full traceback:")
    traceback.print_exc()
    sys.exit(1) 