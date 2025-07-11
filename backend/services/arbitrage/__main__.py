#!/usr/bin/env python3
"""
ASCEP Arbitrage Service
Module entry point for the Arbitrage service
"""

import os
import sys

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

from arbitrage_service import app

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)
    
    print("📈 Starting ASCEP Arbitrage Service...")
    print("🌐 Service will be available at: http://localhost:5003")
    
    app.run(host='0.0.0.0', port=5003, debug=False) 