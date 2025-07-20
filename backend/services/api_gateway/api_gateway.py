"""
ASCEP API Gateway
Routes requests to different microservices with latency monitoring
"""

import os
import json
import logging
import requests
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import redis
from dotenv import load_dotenv

from backend.services.api_gateway.service_registry import service_registry
from backend.services.api_gateway.latency_monitor import LatencyMonitor

# Load environment variable
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Initialize CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Initialize Redis
try:
    redis_url = os.getenv('REDIS_URL')
    if redis_url:
        logger.info(f"🔗 Connecting to Redis via URL: {redis_url[:20]}...")
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
        
        logger.info(f"🔗 Connecting to Redis at {redis_host}:{redis_port}")
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

def redis_price_update_listener():
    if not redis_client:
        logger.warning("Redis not initialized; no real‑time updates.")
        return

    pubsub = redis_client.pubsub()
    pubsub.subscribe('price_updates')
    logger.info("🔔 Subscribed to price_updates channel")

    while True:
        try:
            message = pubsub.get_message(timeout=1)
            if message and message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    # emit to all connected WebSocket clients
                    socketio.emit('price_update', data)
                    logger.info(f"Emitted price update: {data['symbol']}")
                except Exception as e:
                    logger.error(f"Error emitting price update: {e}")
            # No sleep - run as fast as possible for real-time performance
        except Exception as e:
            logger.error(f"Redis listener error: {e}")
            # Try to reconnect
            try:
                pubsub.close()
                pubsub = redis_client.pubsub()
                pubsub.subscribe('price_updates')
                logger.info("Reconnected to Redis pub/sub")
            except Exception as reconnect_error:
                logger.error(f"Failed to reconnect to Redis: {reconnect_error}")
                socketio.sleep(0.1)  # Minimal sleep on error to prevent infinite loops

def redis_arbitrage_signals_listener():
    if not redis_client:
        logger.warning("Redis not initialized; no arbitrage signal updates.")
        return

    pubsub = redis_client.pubsub()
    pubsub.subscribe('arbitrage_signals')
    logger.info("🔔 Subscribed to arbitrage_signals channel")

    while True:
        try:
            message = pubsub.get_message(timeout=1)
            if message and message['type'] == 'message':
                try:
                    signal = json.loads(message['data'])
                    # emit to all connected WebSocket clients
                    socketio.emit('arbitrage_signal', signal)
                    logger.info(f"Emitted arbitrage signal: {signal.get('type', 'unknown')} - {signal.get('spread_percentage', 0):.2f}%")
                except Exception as e:
                    logger.error(f"Error emitting arbitrage signal: {e}")
            # No sleep - run as fast as possible for real-time performance
        except Exception as e:
            logger.error(f"Arbitrage signals Redis listener error: {e}")
            # Try to reconnect
            try:
                pubsub.close()
                pubsub = redis_client.pubsub()
                pubsub.subscribe('arbitrage_signals')
                logger.info("Reconnected to arbitrage signals Redis pub/sub")
            except Exception as reconnect_error:
                logger.error(f"Failed to reconnect to arbitrage signals Redis: {reconnect_error}")
                socketio.sleep(0.1)  # Minimal sleep on error to prevent infinite loops

def redis_cep_signals_listener():
    if not redis_client:
        logger.warning("Redis not initialized; no CEP signal updates.")
        return

    pubsub = redis_client.pubsub()
    pubsub.subscribe('cep_signals')
    logger.info("🔔 Subscribed to cep_signals channel")

    while True:
        try:
            message = pubsub.get_message(timeout=1)
            if message and message['type'] == 'message':
                try:
                    cep_signal = json.loads(message['data'])
                    
                    # Convert CEP signal to arbitrage signal format for frontend compatibility
                    arbitrage_signal = {
                        'id': f"cep_{cep_signal.get('rule_id', 'unknown')}_{int(time.time())}",
                        'type': 'cep_signal',
                        'rule_id': cep_signal.get('rule_id'),
                        'rule_name': cep_signal.get('rule_name'),
                        'pattern': cep_signal.get('pattern'),
                        'symbols': [cep_signal.get('event_data', {}).get('symbol', 'Unknown')],
                        'spread': 0,  # CEP signals don't have spread
                        'spread_percentage': 0,
                        'severity': cep_signal.get('severity', 'medium'),
                        'timestamp': cep_signal.get('timestamp'),
                        'event_data': cep_signal.get('event_data', {})
                    }
                    
                    # emit to all connected WebSocket clients
                    socketio.emit('arbitrage_signal', arbitrage_signal)
                    logger.info(f"Emitted CEP signal: {cep_signal.get('rule_name', 'unknown')} - Pattern: {cep_signal.get('pattern', 'unknown')}")
                except Exception as e:
                    logger.error(f"Error emitting CEP signal: {e}")
            # No sleep - run as fast as possible for real-time performance
        except Exception as e:
            logger.error(f"CEP signals Redis listener error: {e}")
            # Try to reconnect
            try:
                pubsub.close()
                pubsub = redis_client.pubsub()
                pubsub.subscribe('cep_signals')
                logger.info("Reconnected to CEP signals Redis pub/sub")
            except Exception as reconnect_error:
                logger.error(f"Failed to reconnect to CEP signals Redis: {reconnect_error}")
                socketio.sleep(0.1)  # Minimal sleep on error to prevent infinite loops

# Initialize latency monitor
latency_monitor = LatencyMonitor(redis_client)

# Function to start background tasks (called after app is ready)
def start_background_tasks():
    """Start background tasks for Redis monitoring"""
    socketio.start_background_task(redis_price_update_listener)
    socketio.start_background_task(redis_arbitrage_signals_listener)
    socketio.start_background_task(redis_cep_signals_listener)

def route_request(service_name: str, endpoint: str = None, method: str = "GET"):
    """Route request to appropriate service with latency monitoring"""
    start_time = time.time()
    
    try:
        # Get service URL from registry
        service_url = service_registry.get_service_url(service_name)
        if not service_url:
            return jsonify({'error': f'Service {service_name} not found or disabled'}), 404
        
        # Build target URL
        if endpoint:
            target_url = f"{service_url}{endpoint}"
        else:
            target_url = service_url
        
        # Make request
        if method == "GET":
            response = requests.get(target_url, timeout=10)
        elif method == "POST":
            response = requests.post(target_url, json=request.get_json(), timeout=10)
        elif method == "PUT":
            response = requests.put(target_url, json=request.get_json(), timeout=10)
        elif method == "DELETE":
            response = requests.delete(target_url, timeout=10)
        else:
            return jsonify({'error': f'Unsupported method: {method}'}), 405
        
        # Calculate latency
        latency_ms = (time.time() - start_time) * 1000
        
        # Record latency
        latency_monitor.record_request(
            service_name=service_name,
            endpoint=endpoint or "/",
            method=method,
            latency_ms=latency_ms,
            status_code=response.status_code,
            success=response.status_code < 400
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.Timeout:
        latency_ms = (time.time() - start_time) * 1000
        latency_monitor.record_request(
            service_name=service_name,
            endpoint=endpoint or "/",
            method=method,
            latency_ms=latency_ms,
            status_code=408,
            success=False
        )
        return jsonify({'error': 'Request timeout'}), 408
        
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        latency_monitor.record_request(
            service_name=service_name,
            endpoint=endpoint or "/",
            method=method,
            latency_ms=latency_ms,
            status_code=500,
            success=False
        )
        logger.error(f"Error routing request to {service_name}: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint - direct health check for API Gateway"""
    return jsonify({
        'service': 'ASCEP API Gateway',
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'redis_connected': redis_client is not None,
        'services_registered': list(service_registry.get_all_services().keys()),
        'port': os.getenv('PORT', '5000'),
        'host': '0.0.0.0'
    }), 200

@app.route('/api/prices', methods=['GET', 'POST'])
def price_routing():
    """Route price requests to price feed service"""
    if request.method == "GET":
        return route_request("price_feed", "/prices", "GET")
    else:
        return route_request("price_feed", "/prices", "POST")

@app.route('/api/signals', methods=['GET', 'POST'])
def signal_routing():
    """Route signal requests to arbitrage service"""
    if request.method == "GET":
        return route_request("arbitrage", "/signals", "GET")
    else:
        return route_request("arbitrage", "/signals", "POST")

@app.route('/api/rules', methods=['GET', 'POST'])
def rules_routing():
    """Route CEP rules requests to CEP engine service"""
    if request.method == "GET":
        return route_request("cep_engine", "/rules", "GET")
    else:
        return route_request("cep_engine", "/rules", "POST")

@app.route('/api/rules/<int:rule_id>', methods=['GET', 'PUT', 'DELETE'])
def rule_routing(rule_id):
    """Route individual CEP rule requests to CEP engine service"""
    if request.method == "GET":
        return route_request("cep_engine", f"/rules/{rule_id}", "GET")
    elif request.method == "PUT":
        return route_request("cep_engine", f"/rules/{rule_id}", "PUT")
    else:
        return route_request("cep_engine", f"/rules/{rule_id}", "DELETE")

@app.route('/api/rules/<int:rule_id>/test', methods=['POST'])
def rule_test_routing(rule_id):
    """Route CEP rule test requests to CEP engine service"""
    return route_request("cep_engine", f"/rules/{rule_id}/test", "POST")

@app.route('/api/tasks', methods=['GET', 'POST'])
def task_routing():
    """Route task requests to celery worker service"""
    if request.method == "GET":
        return route_request("celery_worker", "/tasks", "GET")
    else:
        return route_request("celery_worker", "/tasks", "POST")

@app.route('/api/latency', methods=['GET'])
def latency_stats():
    """Get latency statistics"""
    service_name = request.args.get('service')
    endpoint = request.args.get('endpoint')
    
    stats = latency_monitor.get_latency_stats(service_name, endpoint)
    return jsonify(stats)

@app.route('/api/services', methods=['GET'])
def list_services():
    """List all registered services"""
    services = service_registry.get_all_services()
    return jsonify({
        'services': services,
        'timestamp': datetime.utcnow().isoformat()
    })

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to ASCEP API Gateway'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('subscribe_prices')
def handle_price_subscription(data):
    """Handle price subscription"""
    logger.info(f"Price subscription request: {data}")
    # Forward to price feed service via Redis pub/sub
    if redis_client:
        redis_client.publish('price_subscriptions', json.dumps(data))

@socketio.on('subscribe_signals')
def handle_signal_subscription():
    """Handle signal subscription"""
    logger.info("Signal subscription request")
    # Forward to arbitrage service via Redis pub/sub
    if redis_client:
        redis_client.publish('signal_subscriptions', json.dumps({'action': 'subscribe'}))

@app.route('/')
def gateway_info():
    """API Gateway information"""
    services = service_registry.get_all_services()
    return jsonify({
        'service': 'ASCEP API Gateway',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'services': list(services.keys()),
        'endpoints': {
            '/api/health': 'Health check for all services',
            '/api/prices': 'Price data endpoints',
            '/api/signals': 'Arbitrage signals endpoints',
            '/api/rules': 'CEP rules endpoints',
            '/api/tasks': 'Background task endpoints',
            '/api/latency': 'Latency statistics',
            '/api/services': 'List all services'
        },
        'features': [
            'Service registry for easy service addition',
            'Latency monitoring and statistics',
            'WebSocket support',
            'Redis pub/sub integration'
        ]
    })

# Entry point moved to main.py for proper module execution 