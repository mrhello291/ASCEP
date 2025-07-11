"""
ASCEP Health Service
Monitors health of all microservices
"""

import os
import json
import logging
import requests
import threading
import time
from datetime import datetime
from flask import Flask, jsonify
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
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'health-service-key')

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

# Service configurations
SERVICES = {
    'api_gateway': {
        'port': 5000,
        'endpoint': '/api/health',
        'host': 'api_gateway',
        'name': 'API Gateway'
    },
    'price_feed': {
        'port': 5002,
        'endpoint': '/health',
        'host': 'price_feeds',
        'name': 'Price Feed Service'
    },
    'arbitrage': {
        'port': 5003,
        'endpoint': '/health',
        'host': 'arbitrage',
        'name': 'Arbitrage Service'
    },
    'cep_engine': {
        'port': 5004,
        'endpoint': '/health',
        'host': 'cep_engine',
        'name': 'CEP Engine Service'
    }
}

# Global health status
health_status = {
    'last_check': None,
    'services': {},
    'overall_status': 'unknown'
}

# Global Redis data cache
latest_signal_timestamp = None
current_signals_count = 0

def check_service_health(service_name, config):
    """Check health of a specific service"""
    try:
        url = f"http://{config.get('host', 'localhost')}:{config['port']}{config['endpoint']}"
        start_time = time.time()
        response = requests.get(url, timeout=5)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            return {
                'status': 'healthy',
                'response_time': response_time,
                'last_check': datetime.utcnow().isoformat(),
                'error': None
            }
        else:
            return {
                'status': 'unhealthy',
                'response_time': response_time,
                'last_check': datetime.utcnow().isoformat(),
                'error': f"HTTP {response.status_code}"
            }
    
    except Exception as e:
        return {
            'status': 'unhealthy',
            'response_time': None,
            'last_check': datetime.utcnow().isoformat(),
            'error': str(e)
        }

def update_health_status():
    """Update health status for all services"""
    global health_status
    
    logger.info("🔍 Checking health of all services...")
    
    for service_name, config in SERVICES.items():
        health_status['services'][service_name] = check_service_health(service_name, config)
        logger.info(f"   {config['name']}: {health_status['services'][service_name]['status']}")
    
    # Determine overall status
    healthy_services = sum(1 for service in health_status['services'].values() 
                          if service['status'] == 'healthy')
    total_services = len(health_status['services'])
    
    if healthy_services == total_services:
        health_status['overall_status'] = 'healthy'
    elif healthy_services > 0:
        health_status['overall_status'] = 'degraded'
    else:
        health_status['overall_status'] = 'unhealthy'
    
    health_status['last_check'] = datetime.utcnow().isoformat()
    
    # Store in Redis for other services to access
    if redis_client:
        try:
            redis_client.set('health_status', json.dumps(health_status), ex=300)  # 5 min expiry
        except Exception as e:
            logger.error(f"Failed to store health status in Redis: {e}")

def health_monitor_thread():
    """Background thread for continuous health monitoring"""
    while True:
        try:
            update_health_status()
            time.sleep(30)  # Check every 30 seconds
        except Exception as e:
            logger.error(f"Health monitor thread error: {e}")
            time.sleep(60)  # Wait longer on error

def redis_monitor_thread():
    """Background thread for Redis data monitoring (more frequent)"""
    while True:
        try:
            # Update Redis data more frequently
            if redis_client:
                # Get signals count
                signal_keys = redis_client.keys('signal:*')
                signals_count = len(signal_keys)
                
                # Get latest signal timestamp
                if signal_keys:
                    latest_signal = None
                    for key in signal_keys:
                        signal_data = redis_client.hgetall(key)
                        if signal_data and 'timestamp' in signal_data:
                            if not latest_signal or signal_data['timestamp'] > latest_signal:
                                latest_signal = signal_data['timestamp']
                    
                    # Store latest signal timestamp in memory for quick access
                    global latest_signal_timestamp
                    latest_signal_timestamp = latest_signal
                
                # Store signals count in memory for quick access
                global current_signals_count
                current_signals_count = signals_count
                
            time.sleep(5)  # Check every 5 seconds
        except Exception as e:
            logger.error(f"Redis monitor thread error: {e}")
            time.sleep(10)  # Wait longer on error

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # Get additional system information
    signals_count = current_signals_count
    last_signal_update = latest_signal_timestamp
    price_feeds_count = 0
    
    if redis_client:
        try:
            # Get price feeds count (less frequent, can be real-time)
            price_keys = redis_client.keys('price:*')
            price_feeds_count = len(price_keys)
            
        except Exception as e:
            logger.error(f"Error getting Redis data: {e}")
    
    return jsonify({
        'service': 'Health Service',
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'overall_status': health_status['overall_status'],
        'services': health_status['services'],
        'last_check': health_status['last_check'],
        'signals_count': signals_count,
        'last_signal_update': last_signal_update,
        'price_feeds_count': price_feeds_count
    })

@app.route('/status', methods=['GET'])
def detailed_status():
    """Detailed status endpoint"""
    return jsonify({
        'service': 'Health Service',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'overall_status': health_status['overall_status'],
        'services': health_status['services'],
        'last_check': health_status['last_check'],
        'redis_connected': redis_client is not None,
        'uptime': 'running'  # Could add actual uptime calculation
    })

@app.route('/metrics', methods=['GET'])
def metrics():
    """Metrics endpoint for monitoring"""
    metrics_data = {
        'service': 'Health Service',
        'timestamp': datetime.utcnow().isoformat(),
        'total_services': len(health_status['services']),
        'healthy_services': sum(1 for service in health_status['services'].values() 
                               if service['status'] == 'healthy'),
        'unhealthy_services': sum(1 for service in health_status['services'].values() 
                                 if service['status'] == 'unhealthy'),
        'average_response_time': 0
    }
    
    # Calculate average response time
    response_times = [service['response_time'] for service in health_status['services'].values() 
                     if service['response_time'] is not None]
    if response_times:
        metrics_data['average_response_time'] = sum(response_times) / len(response_times)
    
    return jsonify(metrics_data)

@app.route('/')
def service_info():
    """Service information"""
    return jsonify({
        'service': 'ASCEP Health Service',
        'version': '1.0.0',
        'description': 'Monitors health of all ASCEP microservices',
        'endpoints': {
            '/health': 'Basic health check',
            '/status': 'Detailed status',
            '/metrics': 'Service metrics'
        },
        'monitored_services': list(SERVICES.keys())
    })

if __name__ == '__main__':
    logger.info("🚀 Starting ASCEP Health Service...")
    logger.info(f"📊 Monitoring {len(SERVICES)} services")
    
    # Start health monitoring thread
    monitor_thread = threading.Thread(target=health_monitor_thread, daemon=True)
    monitor_thread.start()
    
    # Start Redis monitoring thread
    redis_monitor_thread = threading.Thread(target=redis_monitor_thread, daemon=True)
    redis_monitor_thread.start()
    
    # Initial health check
    update_health_status()
    
    logger.info("✅ Health service started!")
    app.run(host='0.0.0.0', port=5001, debug=False) 