#!/usr/bin/env python3
"""
ASCEP Price Feed Service
Main entry point for the Price Feed service
"""

import os
import sys

# Add the service directory to Python path
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

from .price_feed_service import main

if __name__ == '__main__':
    main() 