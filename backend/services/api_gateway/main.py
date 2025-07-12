#!/usr/bin/env python3
"""
ASCEP API Gateway Service
Main entry point for the API Gateway service
"""

import os
import sys
import traceback

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

print("=" * 80)
print("🚀 STARTING ASCEP API GATEWAY SERVICE")
print("=" * 80)
print(f"Current working directory: {os.getcwd()}")
print(f"Service directory: {service_dir}")

# Check environment variables
print("\n📋 ENVIRONMENT VARIABLES:")
print(f"PORT: {os.getenv('PORT')}")
print(f"REDIS_URL: {'SET' if os.getenv('REDIS_URL') else 'NOT SET'}")
print(f"DEBUG: {os.getenv('DEBUG')}")
print(f"RAILWAY_ENVIRONMENT: {os.getenv('RAILWAY_ENVIRONMENT')}")
print(f"DOCKER_COMPOSE: {os.getenv('DOCKER_COMPOSE')}")

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
    
    # API Gateway listens on internal port 5000
    # Nginx will proxy external $PORT to internal port 5000
    port = 5000
    external_port = os.getenv('PORT', 'unknown')
    print(f"🌐 API Gateway will listen on internal port {port}")
    print(f"🌐 External access via nginx on port {external_port}")
    
    # Start background tasks
    print("🔄 Starting background tasks...")
    start_background_tasks()
    print("✅ Background tasks started")
    
    # Start the application
    print(f"🚀 Starting Flask/SocketIO server on internal port {port}...")
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=False
    )
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("Full traceback:")
    traceback.print_exc()
    sys.exit(1) 