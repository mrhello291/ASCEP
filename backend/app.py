"""
ASCEP Backend - Main Flask Application
Real-time Complex Event Processing Platform for Arbitrage Signals
"""

import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from flask_restful import Api, Resource
from celery import Celery
import redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['DEBUG'] = os.getenv('DEBUG', 'False').lower() == 'true'

# Initialize CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Initialize Redis
try:
    # Check for Railway Redis URL first
    redis_url = os.getenv('REDIS_URL')
    if redis_url:
        redis_client = redis.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
    else:
        # Fallback to individual environment variables
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            password=os.getenv('REDIS_PASSWORD'),
            db=0,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
    
    # Test Redis connection
    redis_client.ping()
    logger.info("✅ Redis connected successfully")
    logger.info(f"🔗 Redis host: {os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', 6379)}")
except Exception as e:
    logger.warning(f"⚠️ Redis connection failed: {e}")
    logger.info("Running without Redis - some features may be limited")
    redis_client = None

# Initialize Celery
if redis_client:
    celery_app = Celery(
        'ascep',
        broker=f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', 6379)}/0",
        backend=f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', 6379)}/0"
    )
else:
    logger.warning("⚠️ Celery disabled - Redis not available")
    celery_app = None

# Initialize REST API
api = Api(app)

# Global variables for tracking
active_connections = set()
price_data = {}
arbitrage_signals = []

class HealthCheck(Resource):
    """Health check endpoint"""
    def get(self):
        return {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'active_connections': len(active_connections),
            'price_feeds': len(price_data),
            'signals_count': len(arbitrage_signals)
        }

class PriceData(Resource):
    """Price data endpoint"""
    def get(self):
        """Get current price data"""
        return {
            'prices': price_data,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def post(self):
        """Update price data"""
        data = request.get_json()
        if not data:
            return {'error': 'No data provided'}, 400
        
        symbol = data.get('symbol')
        price = data.get('price')
        timestamp = data.get('timestamp', datetime.utcnow().isoformat())
        
        if not symbol or not price:
            return {'error': 'Symbol and price required'}, 400
        
        price_data[symbol] = {
            'price': float(price),
            'timestamp': timestamp
        }
        
        # Emit to WebSocket clients
        socketio.emit('price_update', {
            'symbol': symbol,
            'price': price,
            'timestamp': timestamp
        })
        
        return {'message': 'Price updated successfully'}, 200

class ArbitrageSignals(Resource):
    """Arbitrage signals endpoint"""
    def get(self):
        """Get arbitrage signals"""
        return {
            'signals': arbitrage_signals[-50:],  # Last 50 signals
            'count': len(arbitrage_signals)
        }
    
    def post(self):
        """Create new arbitrage signal"""
        data = request.get_json()
        if not data:
            return {'error': 'No data provided'}, 400
        
        signal = {
            'id': len(arbitrage_signals) + 1,
            'symbols': data.get('symbols', []),
            'spread': data.get('spread', 0),
            'threshold': data.get('threshold', 0),
            'timestamp': datetime.utcnow().isoformat(),
            'severity': data.get('severity', 'medium')
        }
        
        arbitrage_signals.append(signal)
        
        # Emit to WebSocket clients
        socketio.emit('arbitrage_signal', signal)
        
        return {'message': 'Signal created successfully', 'signal': signal}, 201

class CEPRules(Resource):
    """CEP Rules management endpoint"""
    def get(self):
        """Get all CEP rules"""
        if not redis_client:
            return {'error': 'Redis not available'}, 503
        rules = redis_client.hgetall('cep_rules')
        return {'rules': rules}
    
    def post(self):
        """Create new CEP rule"""
        if not redis_client:
            return {'error': 'Redis not available'}, 503
        
        data = request.get_json()
        if not data:
            return {'error': 'No data provided'}, 400
        
        rule_id = data.get('id')
        rule_definition = data.get('definition')
        
        if not rule_id or not rule_definition:
            return {'error': 'Rule ID and definition required'}, 400
        
        redis_client.hset('cep_rules', rule_id, rule_definition)
        
        return {'message': 'Rule created successfully'}, 201

# Register API resources
api.add_resource(HealthCheck, '/api/health')
api.add_resource(PriceData, '/api/prices')
api.add_resource(ArbitrageSignals, '/api/signals')
api.add_resource(CEPRules, '/api/rules')

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    active_connections.add(request.sid)
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to ASCEP'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    active_connections.discard(request.sid)
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('subscribe_prices')
def handle_price_subscription(data):
    """Handle price subscription"""
    symbols = data.get('symbols', [])
    logger.info(f"Client {request.sid} subscribed to prices: {symbols}")
    emit('subscription_confirmed', {'symbols': symbols})

@socketio.on('subscribe_signals')
def handle_signal_subscription():
    """Handle signal subscription"""
    logger.info(f"Client {request.sid} subscribed to signals")
    emit('subscription_confirmed', {'type': 'signals'})

# Serve React app
@app.route('/')
def serve():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return app.send_static_file(path)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    logger.info(f"Starting ASCEP Backend on port {port}")
    logger.info(f"Debug mode: {app.config['DEBUG']}")
    logger.info(f"Redis host: {os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', 6379)}")
    logger.info("ASCEP Backend is ready! Waiting for connections...")
    socketio.run(app, host='0.0.0.0', port=port, debug=app.config['DEBUG']) 