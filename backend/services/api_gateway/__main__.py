#!/usr/bin/env python3
"""
ASCEP API Gateway Service
Module entry point for the API Gateway service
"""

import os
import sys

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

from api_gateway import app, socketio

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)
    
    print("🚀 Starting ASCEP API Gateway Service...")
    print("🌐 Service will be available at: http://localhost:5000")
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=False) 