#!/usr/bin/env python3
"""
ASCEP Crypto Price Feeds Starter
Start Binance WebSocket feeds for crypto monitoring
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'data_ingestion'))

try:
    from price_feeds import BinanceWebSocketFeed, PriceFeedManager
except ImportError:
    print("❌ Error: Could not import price_feeds module")
    print("Make sure you're running this from the project root directory")
    sys.exit(1)
import requests
import json
import time

def send_price_to_backend(symbol, price, timestamp):
    """Send price update to backend API"""
    try:
        data = {
            'symbol': symbol,
            'price': price,
            'timestamp': timestamp
        }
        response = requests.post('http://localhost:5000/api/prices', json=data)
        if response.status_code == 200:
            print(f"✅ Sent {symbol}: ${price:.6f}")
        else:
            print(f"❌ Failed to send {symbol}: {response.status_code}")
    except Exception as e:
        print(f"❌ Error sending {symbol}: {e}")

def main():
    print("🚀 Starting ASCEP Crypto Price Feeds...")
    
    # Initialize price feed manager
    manager = PriceFeedManager()
    
    # Add price callback
    manager.add_price_callback(send_price_to_backend)
    
    # Crypto symbols to monitor
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
    
    # Create and add Binance feed
    binance_feed = BinanceWebSocketFeed(crypto_symbols)
    manager.add_feed(binance_feed)
    
    print(f"📊 Monitoring {len(crypto_symbols)} crypto pairs:")
    for symbol in crypto_symbols:
        print(f"   • {symbol}")
    
    # Connect to feeds
    manager.connect_all()
    
    print("\n✅ Crypto feeds started!")
    print("🌐 Check your dashboard at http://localhost:3001")
    print("📱 Press Ctrl+C to stop")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping crypto feeds...")
        manager.disconnect_all()
        print("✅ Crypto feeds stopped")

if __name__ == "__main__":
    main() 