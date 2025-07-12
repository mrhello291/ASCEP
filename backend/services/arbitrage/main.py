#!/usr/bin/env python3
"""
ASCEP Arbitrage Service
Main entry point for the Arbitrage service
"""

import os
import sys
import threading
import logging

# Configure logging to output to stderr (captured by supervisor)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr)
    ]
)
logger = logging.getLogger(__name__)

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

from backend.services.arbitrage.arbitrage_service import app, arbitrage_detection_thread, redis_price_listener

def start_background_threads():
    """Start background threads for arbitrage detection and Redis listening"""
    
    # Start background threads
    detection_thread = threading.Thread(target=arbitrage_detection_thread, daemon=True)
    detection_thread.start()
    logger.info("✅ Arbitrage detection thread started")
    
    redis_thread = threading.Thread(target=redis_price_listener, daemon=True)
    redis_thread.start()
    logger.info("✅ Redis price listener thread started")

# Start threads when module is imported
start_background_threads()

if __name__ == '__main__':
    logger.info("🚀 Starting ASCEP Arbitrage Service...")
    logger.info("💰 Service will be available at: http://localhost:5003")
    
    app.run(host='0.0.0.0', port=5003, debug=False) 