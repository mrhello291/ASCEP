#!/usr/bin/env python3
"""
ASCEP API Gateway Service
Main entry point for the API Gateway service
"""

import os
import sys
import traceback
import logging

# Configure logging to output to both stderr and stdout for maximum visibility
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr),
        logging.StreamHandler(sys.stdout)
    ],
    force=True
)
logger = logging.getLogger(__name__)

# Force immediate output
sys.stderr.flush()
sys.stdout.flush()

# Also print to stdout as backup (for Railway logs)
print("🚀 ASCEP API GATEWAY STARTING - LOGGING CONFIGURED", flush=True)

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

logger.critical("=" * 80)
logger.critical("🚀 STARTING ASCEP API GATEWAY SERVICE")
logger.critical("=" * 80)
logger.info(f"Current working directory: {os.getcwd()}")
logger.info(f"Service directory: {service_dir}")

# Check environment variables
logger.info("📋 ENVIRONMENT VARIABLES:")
logger.info(f"PORT: {os.getenv('PORT')}")
logger.info(f"REDIS_URL: {'SET' if os.getenv('REDIS_URL') else 'NOT SET'}")
logger.info(f"DEBUG: {os.getenv('DEBUG')}")
logger.info(f"RAILWAY_ENVIRONMENT: {os.getenv('RAILWAY_ENVIRONMENT')}")
logger.info(f"DOCKER_COMPOSE: {os.getenv('DOCKER_COMPOSE')}")

try:
    logger.info("1️⃣ TESTING IMPORTS...")
    
    # Test basic dependencies first
    logger.info("Testing Flask...")
    from flask import Flask
    logger.info("✅ Flask imported successfully")
    
    logger.info("Testing Flask-SocketIO...")
    import flask_socketio
    logger.info("✅ Flask-SocketIO imported successfully")
    
    logger.info("Testing Redis...")
    import redis
    logger.info("✅ Redis imported successfully")
    
    logger.info("Importing service_registry...")
    from backend.services.api_gateway.service_registry import service_registry
    logger.info("✅ service_registry imported successfully")
    
    logger.info("Importing latency_monitor...")
    from backend.services.api_gateway.latency_monitor import LatencyMonitor
    logger.info("✅ latency_monitor imported successfully")
    
    logger.info("Importing api_gateway...")
    from backend.services.api_gateway.api_gateway import app, socketio, start_background_tasks
    logger.info("✅ API Gateway import successful")
    
    logger.info("🚀 STARTING ASCEP API GATEWAY SERVICE...")
    
    # API Gateway listens directly on Railway's $PORT
    port = int(os.getenv('PORT', 5000))
    logger.info(f"🌐 API Gateway will listen directly on port {port}")
    
    # Start background tasks
    logger.info("🔄 Starting background tasks...")
    start_background_tasks()
    logger.info("✅ Background tasks started")
    
    # Start the application
    logger.info(f"🚀 Starting Flask/SocketIO server on internal port {port}...")
    
    # Add error handling for port binding
    try:
        socketio.run(
            app,
            host='0.0.0.0',
            port=port,
            debug=False
        )
    except OSError as e:
        if "Address already in use" in str(e):
            logger.error(f"❌ Port {port} is already in use. This might be because:")
            logger.error(f"   - Another service is running on port {port}")
            logger.error(f"   - A previous instance didn't shut down properly")
            logger.error(f"   - Railway environment has port conflicts")
            logger.error(f"   - Try using a different port")
        else:
            logger.error(f"❌ SocketIO startup error: {e}")
        raise
    
except Exception as e:
    logger.error(f"❌ ERROR: {e}")
    logger.error("Full traceback:")
    logger.error(traceback.format_exc())
    sys.exit(1) 