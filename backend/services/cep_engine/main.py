#!/usr/bin/env python3
"""
ASCEP CEP Engine Service
Main entry point for the CEP Engine service
"""

import os
import sys

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

from .cep_engine_service import app

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)
    
    print("🚀 Starting ASCEP CEP Engine Service...")
    print("🧠 Service will be available at: http://localhost:5004")
    
    app.run(host='0.0.0.0', port=5004, debug=False) 