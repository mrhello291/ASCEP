"""
ASCEP Arbitrage Service
Handles arbitrage signal detection and management
"""

import os
import json
import logging
import threading
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'arbitrage-service-key')

# Initialize CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Redis
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

# Global variables
arbitrage_signals = []
signal_id_counter = 1

# Configuration constants
ARBITRAGE_CONFIG = {
    'cross_currency_threshold': 0.1,  # 0.1% minimum spread for cross-currency
    'triangular_threshold': 0.2,      # 0.2% minimum spread for triangular
    'max_signals_per_cycle': 5,       # Maximum signals to emit per detection cycle
    'signal_memory_limit': 100,       # Maximum signals to keep in memory
    'severity_thresholds': {
        'high': 0.5,    # >0.5% = high severity
        'medium': 0.2,  # >0.2% = medium severity
        'low': 0.0      # >0.0% = low severity
    }
}

# Demo signals for testing
demo_signals = [
    {
        'id': 1,
        'symbols': ['BTCUSDT', 'ETHUSDT'],
        'prices': [45000.0, 3200.0],
        'spread': 0.85,
        'spread_percentage': 0.85,
        'type': 'crypto_arbitrage',
        'timestamp': datetime.utcnow().isoformat(),
        'severity': 'high'
    },
    {
        'id': 2,
        'symbols': ['EUR/USD', 'USD/EUR'],
        'prices': [1.0850, 0.9215],
        'spread': 0.0035,
        'spread_percentage': 0.32,
        'type': 'forex_arbitrage',
        'timestamp': datetime.utcnow().isoformat(),
        'severity': 'medium'
    },
    {
        'id': 3,
        'symbols': ['ADAUSDT', 'DOTUSDT'],
        'prices': [0.45, 6.80],
        'spread': 0.12,
        'spread_percentage': 0.45,
        'type': 'altcoin_arbitrage',
        'timestamp': datetime.utcnow().isoformat(),
        'severity': 'medium'
    }
]

# Initialize with demo signals
arbitrage_signals.extend(demo_signals)
signal_id_counter = len(demo_signals) + 1

# In-memory price cache for HFT-style detection
latest_prices = {}

def redis_price_listener():
    """Listen for price updates from Redis and update in-memory cache"""
    if not redis_client:
        return
    pubsub = redis_client.pubsub()
    pubsub.subscribe('price_updates')
    logger.info("👂 Listening for price updates...")
    for message in pubsub.listen():
        if message['type'] == 'message':
            try:
                data = json.loads(message['data'])
                symbol = data['symbol']
                price = data['price']
                timestamp = data.get('timestamp')
                latest_prices[symbol] = (price, timestamp)
                detect_arbitrage_opportunities()
            except Exception as e:
                logger.error(f"Error processing price update: {e}")


def detect_arbitrage_opportunities():
    """Detect arbitrage opportunities from in-memory price cache (no Redis scan)"""
    try:
        now = time.time()
        # Only use prices updated within the last 1 second
        fresh_prices = {}
        for symbol, (price, ts) in latest_prices.items():
            try:
                age = now - datetime.fromisoformat(ts).timestamp()
                if age <= 0.5:
                    fresh_prices[symbol] = price
            except Exception as e:
                logger.warning(f"Could not parse timestamp for {symbol}: {ts} ({e})")
        prices = fresh_prices
        
        # Simple arbitrage detection logic
        opportunities = []
        seen_cross = set()  # Deduplicate cross-currency pairs
        seen_triangular = set()  # Deduplicate triangular cycles
        
        # Check for cross-currency arbitrage (e.g., EUR/USD vs USD/EUR)
        for symbol, price in prices.items():
            if '/' in symbol:
                base, quote = symbol.split('/')
                reverse_symbol = f"{quote}/{base}"
                
                # Create canonical key to avoid duplicates
                canonical_pair = tuple(sorted([symbol, reverse_symbol]))
                if canonical_pair in seen_cross:
                    continue
                seen_cross.add(canonical_pair)
                
                if reverse_symbol in prices:
                    reverse_price = prices[reverse_symbol]
                    if reverse_price > 0:
                        # Calculate spread
                        theoretical_price = 1 / reverse_price
                        spread = abs(price - theoretical_price)
                        spread_percentage = (spread / price) * 100
                        
                        # If spread is significant (>0.1%), add to opportunities
                        if spread_percentage > ARBITRAGE_CONFIG['cross_currency_threshold']:
                            opportunities.append({
                                'symbols': [symbol, reverse_symbol],
                                'prices': [price, reverse_price],
                                'spread': spread,
                                'spread_percentage': spread_percentage,
                                'type': 'cross_currency'
                            })
        
        # Check for triangular arbitrage (e.g., EUR/USD, USD/JPY, EUR/JPY)
        for symbol1, price1 in prices.items():
            if '/' in symbol1:
                base1, quote1 = symbol1.split('/')
                
                for symbol2, price2 in prices.items():
                    if '/' in symbol2 and symbol2 != symbol1:
                        base2, quote2 = symbol2.split('/')
                        
                        # Look for triangular opportunity
                        if quote1 == base2:
                            # Check if we have the third pair
                            third_symbol = f"{base1}/{quote2}"
                            if third_symbol in prices:
                                # Create canonical key for triangular cycle
                                cycle_symbols = tuple(sorted([symbol1, symbol2, third_symbol]))
                                if cycle_symbols in seen_triangular:
                                    continue
                                seen_triangular.add(cycle_symbols)
                                
                                third_price = prices[third_symbol]
                                
                                # Calculate theoretical price through cross
                                theoretical_price = price1 * price2
                                spread = abs(third_price - theoretical_price)
                                spread_percentage = (spread / third_price) * 100
                                
                                if spread_percentage > ARBITRAGE_CONFIG['triangular_threshold']:  # Higher threshold for triangular
                                    opportunities.append({
                                        'symbols': [symbol1, symbol2, third_symbol],
                                        'prices': [price1, price2, third_price],
                                        'spread': spread,
                                        'spread_percentage': spread_percentage,
                                        'type': 'triangular'
                                    })
        
        # Sort by spread percentage (highest first) and take top N
        if opportunities:
            opportunities.sort(key=lambda x: x['spread_percentage'], reverse=True)
            top_opportunities = opportunities[:ARBITRAGE_CONFIG['max_signals_per_cycle']]  # Limit to top N most profitable
            
            # Create signals for top opportunities
            for opp in top_opportunities:
                create_arbitrage_signal(opp)
                
            logger.info(f"📊 Found {len(opportunities)} opportunities, emitted top {len(top_opportunities)} signals")
        
    except Exception as e:
        logger.error(f"Error detecting arbitrage opportunities: {e}")

def create_arbitrage_signal(opportunity):
    """Create an arbitrage signal"""
    global signal_id_counter
    
    try:
        # Improved severity calculation with better thresholds
        spread_pct = opportunity['spread_percentage']
        thresholds = ARBITRAGE_CONFIG['severity_thresholds']
        
        if spread_pct > thresholds['high']:
            severity = 'high'
        elif spread_pct > thresholds['medium']:
            severity = 'medium'
        else:
            severity = 'low'
        
        signal = {
            'id': signal_id_counter,
            'symbols': opportunity['symbols'],
            'prices': opportunity['prices'],
            'spread': opportunity['spread'],
            'spread_percentage': opportunity['spread_percentage'],
            'type': opportunity['type'],
            'timestamp': datetime.utcnow().isoformat(),
            'severity': severity
        }
        
        signal_id_counter += 1
        
        # Store in memory
        arbitrage_signals.append(signal)
        
        # Keep only last N signals
        if len(arbitrage_signals) > ARBITRAGE_CONFIG['signal_memory_limit']:
            arbitrage_signals.pop(0)
        
        # Store in Redis
        if redis_client:
            signal_key = f"signal:{signal['id']}"
            # Convert lists to JSON strings for Redis storage
            redis_signal = signal.copy()
            redis_signal['symbols'] = json.dumps(signal['symbols'])
            redis_signal['prices'] = json.dumps(signal['prices'])
            redis_client.hset(signal_key, mapping=redis_signal)
            redis_client.expire(signal_key, 86400)  # 24 hours
            
            # Publish to Redis channel
            redis_client.publish('arbitrage_signals', json.dumps(signal))
        
        logger.info(f"🚨 Arbitrage signal created: {signal['type']} - {signal['spread_percentage']:.2f}% spread ({severity})")
        
    except Exception as e:
        logger.error(f"Error creating arbitrage signal: {e}")

# Remove the periodic detection thread since we detect on every price update
# def arbitrage_detection_thread():
#     """Background thread for continuous arbitrage detection"""
#     while True:
#         try:
#             detect_arbitrage_opportunities()
#             time.sleep(10)  # Check every 10 seconds
#         except Exception as e:
#             logger.error(f"Arbitrage detection thread error: {e}")
#             time.sleep(30)  # Wait longer on error

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'service': 'Arbitrage Service',
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'signals_count': len(arbitrage_signals),
        'redis_connected': redis_client is not None
    })

@app.route('/signals', methods=['GET'])
def get_signals():
    """Get arbitrage signals"""
    limit = request.args.get('limit', 50, type=int)
    signals = arbitrage_signals[-limit:] if arbitrage_signals else []
    
    return jsonify({
        'signals': signals,
        'count': len(signals),
        'total_count': len(arbitrage_signals),
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/signals', methods=['POST'])
def create_signal():
    """Create a new arbitrage signal manually"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['symbols', 'spread']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create opportunity object
        opportunity = {
            'symbols': data['symbols'],
            'prices': data.get('prices', [0] * len(data['symbols'])),
            'spread': data['spread'],
            'spread_percentage': data.get('spread_percentage', 0),
            'type': data.get('type', 'manual')
        }
        
        create_arbitrage_signal(opportunity)
        
        return jsonify({'message': 'Signal created successfully'}), 201
    
    except Exception as e:
        logger.error(f"Error creating signal: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/signals/<int:signal_id>', methods=['GET'])
def get_signal(signal_id):
    """Get a specific arbitrage signal"""
    for signal in arbitrage_signals:
        if signal['id'] == signal_id:
            return jsonify(signal)
    
    return jsonify({'error': 'Signal not found'}), 404

@app.route('/signals/<int:signal_id>', methods=['DELETE'])
def delete_signal(signal_id):
    """Delete a specific arbitrage signal"""
    global arbitrage_signals
    
    for i, signal in enumerate(arbitrage_signals):
        if signal['id'] == signal_id:
            deleted_signal = arbitrage_signals.pop(i)
            
            # Remove from Redis
            if redis_client:
                signal_key = f"signal:{signal_id}"
                redis_client.delete(signal_key)
            
            return jsonify({'message': 'Signal deleted successfully', 'signal': deleted_signal})
    
    return jsonify({'error': 'Signal not found'}), 404

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get arbitrage statistics"""
    if not arbitrage_signals:
        return jsonify({
            'total_signals': 0,
            'high_severity': 0,
            'medium_severity': 0,
            'average_spread': 0,
            'last_signal': None
        })
    
    high_severity = sum(1 for s in arbitrage_signals if s['severity'] == 'high')
    medium_severity = sum(1 for s in arbitrage_signals if s['severity'] == 'medium')
    spreads = [s['spread_percentage'] for s in arbitrage_signals if 'spread_percentage' in s]
    average_spread = sum(spreads) / len(spreads) if spreads else 0
    
    return jsonify({
        'total_signals': len(arbitrage_signals),
        'high_severity': high_severity,
        'medium_severity': medium_severity,
        'average_spread': average_spread,
        'last_signal': arbitrage_signals[-1]['timestamp'] if arbitrage_signals else None
    })

@app.route('/config', methods=['GET', 'POST'])
def arbitrage_config():
    """Get or update arbitrage config at runtime"""
    global ARBITRAGE_CONFIG
    if request.method == 'GET':
        return jsonify(ARBITRAGE_CONFIG)
    elif request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        # Only update known keys
        for key in ARBITRAGE_CONFIG:
            if key in data:
                if isinstance(ARBITRAGE_CONFIG[key], dict) and isinstance(data[key], dict):
                    ARBITRAGE_CONFIG[key].update(data[key])
                else:
                    ARBITRAGE_CONFIG[key] = data[key]
        return jsonify({'message': 'Config updated', 'config': ARBITRAGE_CONFIG})

@app.route('/')
def service_info():
    """Service information"""
    return jsonify({
        'service': 'ASCEP Arbitrage Service',
        'version': '1.0.0',
        'description': 'Detects and manages arbitrage opportunities',
        'endpoints': {
            '/health': 'Health check',
            '/signals': 'Get/create arbitrage signals',
            '/signals/<id>': 'Get/delete specific signal',
            '/stats': 'Arbitrage statistics'
        },
        'active_signals': len(arbitrage_signals)
    })

if __name__ == '__main__':
    logger.info("🚀 Starting ASCEP Arbitrage Service...")
    
    # Start background threads
    # detection_thread = threading.Thread(target=arbitrage_detection_thread, daemon=True)
    # detection_thread.start()
    
    redis_thread = threading.Thread(target=redis_price_listener, daemon=True)
    redis_thread.start()
    
    logger.info("✅ Arbitrage service started!")
    app.run(host='0.0.0.0', port=5003, debug=False) 