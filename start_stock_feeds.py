#!/usr/bin/env python3
"""
ASCEP Stock & Forex Price Feeds Starter
Start Alpha Vantage feeds for stock and forex monitoring
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'data_ingestion'))

try:
    from price_feeds import AlphaVantageFeed, PriceFeedManager
except ImportError:
    print("❌ Error: Could not import price_feeds module")
    print("Make sure you're running this from the project root directory")
    sys.exit(1)

import requests
import json
import time
import os

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
    print("🚀 Starting ASCEP Stock & Forex Price Feeds...")
    
    # Check for Alpha Vantage API key
    api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
    if not api_key:
        print("❌ Alpha Vantage API key not found!")
        print("Please set your API key:")
        print("   export ALPHA_VANTAGE_API_KEY='your_api_key_here'")
        print("   Or get a free key from: https://www.alphavantage.co/")
        return
    
    # Initialize price feed manager
    manager = PriceFeedManager()
    
    # Add price callback
    manager.add_price_callback(send_price_to_backend)
    
    # Forex pairs to monitor
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
    
    # Stock symbols to monitor (using Alpha Vantage)
    stock_symbols = [
        'AAPL',        # Apple Inc.
        'MSFT',        # Microsoft Corporation
        'GOOGL',       # Alphabet Inc.
        'AMZN',        # Amazon.com Inc.
        'TSLA',        # Tesla Inc.
        'META',        # Meta Platforms Inc.
        'NVDA',        # NVIDIA Corporation
        'BRK.A',       # Berkshire Hathaway Inc.
        'JPM',         # JPMorgan Chase & Co.
        'V'            # Visa Inc.
    ]
    
    # Create and add Alpha Vantage feed for forex
    forex_feed = AlphaVantageFeed(forex_symbols, api_key)
    manager.add_feed(forex_feed)
    
    print(f"📊 Monitoring {len(forex_symbols)} forex pairs:")
    for symbol in forex_symbols:
        print(f"   • {symbol}")
    
    print(f"\n📈 Monitoring {len(stock_symbols)} stocks:")
    for symbol in stock_symbols:
        print(f"   • {symbol}")
    
    # Connect to feeds
    manager.connect_all()
    
    print("\n✅ Stock & Forex feeds started!")
    print("🌐 Check your dashboard at http://localhost:3001")
    print("📱 Press Ctrl+C to stop")
    print("⏰ Note: Alpha Vantage free tier has rate limits (1 request per second)")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping stock & forex feeds...")
        manager.disconnect_all()
        print("✅ Stock & forex feeds stopped")

if __name__ == "__main__":
    main() 