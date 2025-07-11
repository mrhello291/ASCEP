"""
ASCEP Celery Worker
Background task processing for CEP engine
"""

import os
import json
import logging
from datetime import datetime
from celery import Celery
from celery.utils.log import get_task_logger
import redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = get_task_logger(__name__)

# Initialize Celery with Redis connection (check both naming conventions)
redis_host = os.getenv('REDIS_HOST') or os.getenv('REDISHOST', 'localhost')
redis_port = int(os.getenv('REDIS_PORT') or os.getenv('REDISPORT', 6379))
redis_password = os.getenv('REDIS_PASSWORD') or os.getenv('REDISPASSWORD')

# Build Redis URL for Celery
if redis_password:
    redis_url = f"redis://:{redis_password}@{redis_host}:{redis_port}/0"
else:
    redis_url = f"redis://{redis_host}:{redis_port}/0"

celery_app = Celery(
    'ascep',
    broker=redis_url,
    backend=redis_url
)

# Initialize Redis
redis_client = redis.Redis(
    host=redis_host,
    port=redis_port,
    password=redis_password,
    db=0,
    decode_responses=True
)

@celery_app.task
def process_price_data(symbol: str, price: float, timestamp: str):
    """Process incoming price data and check CEP rules"""
    try:
        logger.info(f"Processing price data for {symbol}: {price}")
        
        # Store price data in Redis
        price_key = f"price:{symbol}"
        redis_client.hset(price_key, 'price', price)
        redis_client.hset(price_key, 'timestamp', timestamp)
        
        # Check CEP rules
        check_cep_rules.delay(symbol, price)
        
        return {'status': 'success', 'symbol': symbol, 'price': price}
    
    except Exception as e:
        logger.error(f"Error processing price data: {e}")
        return {'status': 'error', 'error': str(e)}

@celery_app.task
def check_cep_rules(symbol: str, price: float):
    """Check CEP rules for arbitrage opportunities"""
    try:
        logger.info(f"Checking CEP rules for {symbol}")
        
        # Get all CEP rules from Redis
        rules = redis_client.hgetall('cep_rules')
        
        for rule_id, rule_definition in rules.items():
            try:
                # Parse and evaluate rule
                result = evaluate_rule(rule_definition, symbol, price)
                
                if result.get('triggered'):
                    # Create arbitrage signal
                    signal = {
                        'id': f"{rule_id}_{datetime.utcnow().timestamp()}",
                        'rule_id': rule_id,
                        'symbols': result.get('symbols', []),
                        'spread': result.get('spread', 0),
                        'threshold': result.get('threshold', 0),
                        'timestamp': datetime.utcnow().isoformat(),
                        'severity': result.get('severity', 'medium')
                    }
                    
                    # Store signal in Redis
                    signal_key = f"signal:{signal['id']}"
                    redis_client.hmset(signal_key, signal)
                    
                    # Publish to Redis channel for real-time updates
                    redis_client.publish('arbitrage_signals', json.dumps(signal))
                    
                    logger.info(f"Arbitrage signal triggered: {signal}")
                    
            except Exception as e:
                logger.error(f"Error evaluating rule {rule_id}: {e}")
        
        return {'status': 'success', 'rules_checked': len(rules)}
    
    except Exception as e:
        logger.error(f"Error checking CEP rules: {e}")
        return {'status': 'error', 'error': str(e)}

def evaluate_rule(rule_definition: str, symbol: str, price: float):
    """Evaluate a CEP rule definition"""
    try:
        # Simple rule evaluation logic
        # In a real implementation, you'd use a proper DSL parser
        
        # Example rule format: "IF price('EUR/USD') - price('USD/EUR') > 0.001 THEN ARBITRAGE_SIGNAL"
        
        # For now, implement a simple arbitrage detection
        if 'EUR/USD' in symbol and price > 0:
            # Get USD/EUR price from Redis
            usd_eur_price = redis_client.hget('price:USD/EUR', 'price')
            
            if usd_eur_price:
                usd_eur_price = float(usd_eur_price)
                spread = abs(price - (1 / usd_eur_price))
                
                # Check if spread exceeds threshold
                threshold = 0.001  # 1 pip
                
                if spread > threshold:
                    return {
                        'triggered': True,
                        'symbols': [symbol, 'USD/EUR'],
                        'spread': spread,
                        'threshold': threshold,
                        'severity': 'high' if spread > 0.005 else 'medium'
                    }
        
        return {'triggered': False}
    
    except Exception as e:
        logger.error(f"Error evaluating rule: {e}")
        return {'triggered': False, 'error': str(e)}

@celery_app.task
def cleanup_old_data():
    """Clean up old price data and signals"""
    try:
        logger.info("Cleaning up old data")
        
        # Remove price data older than 1 hour
        current_time = datetime.utcnow().timestamp()
        price_keys = redis_client.keys('price:*')
        
        for key in price_keys:
            timestamp = redis_client.hget(key, 'timestamp')
            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    if (current_time - dt.timestamp()) > 3600:  # 1 hour
                        redis_client.delete(key)
                except:
                    pass
        
        # Remove signals older than 24 hours
        signal_keys = redis_client.keys('signal:*')
        
        for key in signal_keys:
            timestamp = redis_client.hget(key, 'timestamp')
            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    if (current_time - dt.timestamp()) > 86400:  # 24 hours
                        redis_client.delete(key)
                except:
                    pass
        
        return {'status': 'success', 'cleaned_keys': len(price_keys) + len(signal_keys)}
    
    except Exception as e:
        logger.error(f"Error cleaning up old data: {e}")
        return {'status': 'error', 'error': str(e)}

@celery_app.task
def health_check():
    """Periodic health check task"""
    try:
        # Check Redis connection
        redis_client.ping()
        
        # Check active tasks
        active_tasks = celery_app.control.inspect().active()
        
        return {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'redis_connected': True,
            'active_tasks': len(active_tasks.get('celery@worker', [])) if active_tasks else 0
        }
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {'status': 'unhealthy', 'error': str(e)}

if __name__ == '__main__':
    celery_app.start() 