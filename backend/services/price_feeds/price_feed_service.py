#!/usr/bin/env python3
"""
ASCEP Price Feed Service
Standalone service for running price feeds on Railway
"""
import os
import sys
import time
import requests
import json
import redis
import logging
import threading
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from price_feeds import BinanceWebSocketFeed, MockPriceFeed, PriceFeedManager
    print("✅ Successfully imported price_feeds module")
except ImportError as e:
    print(f"❌ Error importing price feeds: {e}")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'price-feed-service-key')

# Initialize CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Global variables for health status
feed_manager = None
service_start_time = datetime.utcnow()

def send_price_to_backend(symbol, price, timestamp):
    """Send price update to backend API and Redis"""
    try:
        data = {
            'symbol': symbol,
            'price': price,
            'timestamp': timestamp,
            'type': 'price_update'
        }
        
        # Store in Redis
        if redis_client:
            price_key = f"price:{symbol}"
            redis_client.hmset(price_key, {
                'price': price,
                'timestamp': timestamp
            })
            redis_client.expire(price_key, 3600)  # 1 hour expiry
            
            # Publish to Redis channel for real-time updates
            redis_client.publish('price_updates', json.dumps(data))
            redis_client.publish('events', json.dumps(data))
        
        # Send to API Gateway (port 5000)
        try:
            # Use environment variable or default to localhost
            gateway_url = os.getenv('API_GATEWAY_URL', 'http://localhost:5000')
            response = requests.post(f'{gateway_url}/api/prices', json=data, timeout=5)
            
            if response.status_code == 200:
                logger.info(f"✅ {symbol}: ${price:.6f}")
            else:
                logger.warning(f"⚠️ {symbol}: Gateway HTTP {response.status_code}")
                
        except Exception as e:
            logger.warning(f"⚠️ {symbol}: Gateway error - {e}")
            
    except Exception as e:
        logger.error(f"❌ {symbol}: {e}")

# Initialize Redis connection
try:
    redis_url = os.getenv('REDIS_URL')
    if redis_url:
        redis_client = redis.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
    else:
        redis_host = os.getenv('REDIS_HOST') or os.getenv('REDISHOST', 'localhost')
        redis_port = int(os.getenv('REDIS_PORT') or os.getenv('REDISPORT', 6379))
        redis_password = os.getenv('REDIS_PASSWORD') or os.getenv('REDISPASSWORD')
        
        redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            password=redis_password,
            db=0,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
    
    redis_client.ping()
    logger.info("✅ Redis connected successfully")
except Exception as e:
    logger.warning(f"⚠️ Redis connection failed: {e}")
    redis_client = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    global feed_manager
    
    status = {
        'service': 'Price Feed Service',
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'uptime': str(datetime.utcnow() - service_start_time),
        'redis_connected': redis_client is not None,
        'feeds': {}
    }
    
    if feed_manager:
        feed_status = feed_manager.get_feed_status()
        status['feeds'] = feed_status
        status['total_feeds'] = len(feed_status)
        status['connected_feeds'] = sum(1 for connected in feed_status.values() if connected)
    
    return jsonify(status)

@app.route('/status', methods=['GET'])
def detailed_status():
    """Detailed status endpoint"""
    return jsonify({
        'service': 'Price Feed Service',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'uptime': str(datetime.utcnow() - service_start_time),
        'redis_connected': redis_client is not None,
        'endpoints': {
            'health': '/health',
            'status': '/status'
        }
    })

@app.route('/prices', methods=['GET', 'POST'])
def prices_endpoint():
    """Handle price data requests"""
    global feed_manager
    
    if request.method == 'POST':
        # Handle incoming price updates
        try:
            data = request.get_json()
            if data:
                logger.info(f"Received price update: {data}")
                return jsonify({'status': 'success', 'message': 'Price update received'}), 200
            else:
                return jsonify({'error': 'No data provided'}), 400
        except Exception as e:
            logger.error(f"Error processing price update: {e}")
            return jsonify({'error': str(e)}), 500
    
    else:  # GET request
        # Return current price data
        try:
            # Get current prices from Redis or return empty dict
            prices = {}
            if redis_client:
                # Get all price keys from Redis
                price_keys = redis_client.keys('price:*')
                for key in price_keys:
                    symbol = key.replace('price:', '')
                    price_data = redis_client.hgetall(key)
                    if price_data:
                        prices[symbol] = {
                            'price': float(price_data.get('price', 0)),
                            'timestamp': price_data.get('timestamp', '')
                        }
            
            return jsonify({
                'prices': prices,
                'timestamp': datetime.utcnow().isoformat(),
                'total_pairs': len(prices)
            }), 200
        except Exception as e:
            logger.error(f"Error retrieving prices: {e}")
            return jsonify({'error': str(e)}), 500

def run_flask_app():
    """Run Flask app in a separate thread"""
    app.run(host='0.0.0.0', port=5002, debug=False, use_reloader=False)

def main():
    global feed_manager
    logger.info("🚀 Starting ASCEP Price Feed Service...")
    
    # Initialize price feed manager
    feed_manager = PriceFeedManager()
    feed_manager.add_price_callback(send_price_to_backend)
    
    # Crypto symbols (Binance WebSocket - Real-time)
    crypto_symbols = [
        'BTC/USDT',    # Bitcoin
        'ETH/USDT',    # Ethereum
        'BNB/USDT',    # Binance Coin
        'ADA/USDT',    # Cardano
        'SOL/USDT',    # Solana
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
    feed_manager.add_feed(binance_feed)
    
    # Add mock feed for forex (since no API keys in production)
    logger.info("💱 Adding mock forex feed...")
    mock_feed = MockPriceFeed(forex_symbols)
    feed_manager.add_feed(mock_feed)
    
    # Connect to all feeds
    logger.info("🔌 Connecting to all feeds...")
    feed_manager.connect_all()
    
    logger.info("✅ Price feed service started!")
    
    # Start Flask app in a separate thread
    flask_thread = threading.Thread(target=run_flask_app, daemon=True)
    flask_thread.start()
    logger.info("🌐 Flask app started on port 5002")
    
    logger.info("📱 Press Ctrl+C to stop")
    
    # Keep the service running
    try:
        while True:
            time.sleep(30)
            
            # Log status every 30 seconds
            status = feed_manager.get_feed_status()
            logger.info("📊 Feed Status:")
            for feed_name, is_connected in status.items():
                status_icon = "✅" if is_connected else "❌"
                logger.info(f"   {status_icon} {feed_name}: {'Connected' if is_connected else 'Disconnected'}")
                
    except KeyboardInterrupt:
        logger.info("🛑 Stopping price feed service...")
        feed_manager.disconnect_all()
        logger.info("✅ Price feed service stopped")

if __name__ == "__main__":
    main() 