#!/usr/bin/env python3
"""
ASCEP Health Service
Module entry point for the Health service
"""

import os
import sys

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

from health_service import app

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)
    
    print("🏥 Starting ASCEP Health Service...")
    print("🌐 Service will be available at: http://localhost:5001")
    
    app.run(host='0.0.0.0', port=5001, debug=False) 