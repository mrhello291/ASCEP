#!/usr/bin/env python3
"""
ASCEP CEP Engine Service
Main entry point for the CEP Engine service
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

from backend.services.cep_engine.cep_engine_service import app
# from cep_engine_service import app

if __name__ == '__main__':
    logger.info("🚀 Starting ASCEP CEP Engine Service...")
    logger.info("🧠 Service will be available at: http://localhost:5004")
    
    app.run(host='0.0.0.0', port=5004, debug=False) 