#!/usr/bin/env python3
"""
ASCEP Complete Market Monitoring
Start both crypto and stock/forex price feeds simultaneously
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'data_ingestion'))

try:
    from price_feeds import BinanceWebSocketFeed, AlphaVantageFeed, PriceFeedManager
except ImportError:
    print("❌ Error: Could not import price_feeds module")
    print("Make sure you're running this from the project root directory")
    sys.exit(1)

import requests
import json
import time
import threading

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
            print(f"✅ {symbol}: ${price:.6f}")
        else:
            print(f"❌ {symbol}: {response.status_code}")
    except Exception as e:
        print(f"❌ {symbol}: {e}")

def main():
    print("🚀 Starting ASCEP Complete Market Monitoring...")
    print("=" * 50)
    
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
    
    # Forex pairs (Alpha Vantage - 1 min intervals)
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
    
    # Stock symbols (Alpha Vantage - 1 min intervals)
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
    
    print("📊 Setting up monitoring for:")
    print(f"   🪙 {len(crypto_symbols)} Crypto pairs (Real-time via Binance)")
    print(f"   💱 {len(forex_symbols)} Forex pairs (1-min updates via Alpha Vantage)")
    print(f"   📈 {len(stock_symbols)} Stocks (1-min updates via Alpha Vantage)")
    
    # Add Binance crypto feed
    print("\n🪙 Adding Binance crypto feed...")
    binance_feed = BinanceWebSocketFeed(crypto_symbols)
    manager.add_feed(binance_feed)
    
    # Add Alpha Vantage feed for forex and stocks
    api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
    if api_key:
        print("📈 Adding Alpha Vantage stock/forex feed...")
        all_alpha_symbols = forex_symbols + stock_symbols
        alpha_feed = AlphaVantageFeed(all_alpha_symbols, api_key)
        manager.add_feed(alpha_feed)
    else:
        print("⚠️  Alpha Vantage API key not found - skipping stocks/forex")
        print("   Set ALPHA_VANTAGE_API_KEY environment variable to enable")
    
    # Connect to all feeds
    print("\n🔌 Connecting to all feeds...")
    manager.connect_all()
    
    print("\n✅ Complete market monitoring started!")
    print("=" * 50)
    print("🌐 Dashboard: http://localhost:3001")
    print("🔧 Backend API: http://localhost:5000/api/health")
    print("📱 Press Ctrl+C to stop all feeds")
    print("=" * 50)
    
    # Display feed status
    def status_monitor():
        while True:
            time.sleep(30)  # Update every 30 seconds
            status = manager.get_feed_status()
            print("\n📊 Feed Status:")
            for feed_name, is_connected in status.items():
                status_icon = "✅" if is_connected else "❌"
                print(f"   {status_icon} {feed_name}: {'Connected' if is_connected else 'Disconnected'}")
    
    # Start status monitor in background
    status_thread = threading.Thread(target=status_monitor, daemon=True)
    status_thread.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping all market feeds...")
        manager.disconnect_all()
        print("✅ All feeds stopped")

if __name__ == "__main__":
    main() 