#!/usr/bin/env python3
"""
ASCEP Health Service
Main entry point for the Health service
"""

import os
import sys
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

from .health_service import app

if __name__ == '__main__':
    import threading
    from .health_service import health_monitor_thread, redis_monitor_thread
    
    logger.info("🚀 Starting ASCEP Health Service...")
    logger.info("🏥 Service will be available at: http://localhost:5001")

    # Start health monitor thread
    monitor_thread = threading.Thread(target=health_monitor_thread, daemon=True)
    monitor_thread.start()
    
    # Start Redis monitor thread
    redis_monitor_thread = threading.Thread(target=redis_monitor_thread, daemon=True)
    redis_monitor_thread.start()
    
    app.run(host='0.0.0.0', port=5001, debug=False) 