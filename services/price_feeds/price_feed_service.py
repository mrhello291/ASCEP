#!/usr/bin/env python3
"""
ASCEP Price Feed Service
Standalone service for running price feeds on Railway
"""

import os
import sys
import time
import requests
import logging
from datetime import datetime

# Add data_ingestion to path (relative to project root)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
data_ingestion_path = os.path.join(project_root, 'data_ingestion')
sys.path.append(data_ingestion_path)

try:
    from price_feeds import BinanceWebSocketFeed, MockPriceFeed, PriceFeedManager
except ImportError as e:
    print(f"❌ Error importing price feeds: {e}")
    print(f"Looking for price_feeds in: {data_ingestion_path}")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def send_price_to_backend(symbol, price, timestamp):
    """Send price update to backend API"""
    try:
        data = {
            'symbol': symbol,
            'price': price,
            'timestamp': timestamp
        }
        
        # Get backend URL from environment
        backend_url = os.getenv('RAILWAY_STATIC_URL', 'http://localhost:5000')
        if not backend_url.startswith('http'):
            backend_url = f'https://{backend_url}'
        
        response = requests.post(f'{backend_url}/api/prices', json=data, timeout=10)
        
        if response.status_code == 200:
            logger.info(f"✅ {symbol}: ${price:.6f}")
        else:
            logger.error(f"❌ {symbol}: HTTP {response.status_code}")
            
    except Exception as e:
        logger.error(f"❌ {symbol}: {e}")

def main():
    logger.info("🚀 Starting ASCEP Price Feed Service...")
    
    # Initialize price feed manager
    manager = PriceFeedManager()
    manager.add_price_callback(send_price_to_backend)
    
    # Crypto symbols (Binance WebSocket - Real-time)
    crypto_symbols = [
        'BTC/USDT',    # Bitcoin
        'ETH/USDT',    # Ethereum
        'BNB/USDT',    # Binance Coin
        'ADA/USDT',    # Cardano
        'SOL/USDT',    # Solana
        'DOT/USDT',    # Polkadot
        'LINK/USDT',   # Chainlink
        'MATIC/USDT',  # Polygon
        'AVAX/USDT',   # Avalanche
        'UNI/USDT'     # Uniswap
    ]
    
    # Forex pairs (Mock feed for now)
    forex_symbols = [
        'EUR/USD',     # Euro to US Dollar
        'GBP/USD',     # British Pound to US Dollar
        'USD/JPY',     # US Dollar to Japanese Yen
        'USD/CHF',     # US Dollar to Swiss Franc
        'AUD/USD',     # Australian Dollar to US Dollar
        'USD/CAD',     # US Dollar to Canadian Dollar
        'NZD/USD',     # New Zealand Dollar to US Dollar
        'EUR/GBP',     # Euro to British Pound
        'EUR/JPY',     # Euro to Japanese Yen
        'GBP/JPY'      # British Pound to Japanese Yen
    ]
    
    logger.info(f"📊 Setting up monitoring for:")
    logger.info(f"   🪙 {len(crypto_symbols)} Crypto pairs (Real-time via Binance)")
    logger.info(f"   💱 {len(forex_symbols)} Forex pairs (Mock data)")
    
    # Add Binance crypto feed
    logger.info("🪙 Adding Binance crypto feed...")
    binance_feed = BinanceWebSocketFeed(crypto_symbols)
    manager.add_feed(binance_feed)
    
    # Add mock feed for forex (since no API keys in production)
    logger.info("💱 Adding mock forex feed...")
    mock_feed = MockPriceFeed(forex_symbols)
    manager.add_feed(mock_feed)
    
    # Connect to all feeds
    logger.info("🔌 Connecting to all feeds...")
    manager.connect_all()
    
    logger.info("✅ Price feed service started!")
    logger.info("📱 Press Ctrl+C to stop")
    
    # Keep the service running
    try:
        while True:
            time.sleep(30)
            
            # Log status every 30 seconds
            status = manager.get_feed_status()
            logger.info("📊 Feed Status:")
            for feed_name, is_connected in status.items():
                status_icon = "✅" if is_connected else "❌"
                logger.info(f"   {status_icon} {feed_name}: {'Connected' if is_connected else 'Disconnected'}")
                
    except KeyboardInterrupt:
        logger.info("🛑 Stopping price feed service...")
        manager.disconnect_all()
        logger.info("✅ Price feed service stopped")

if __name__ == "__main__":
    main() 