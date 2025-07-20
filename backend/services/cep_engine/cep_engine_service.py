"""
ASCEP CEP Engine Service
Handles Complex Event Processing rules and pattern detection
"""

import os
import json
import logging
import threading
import time
import re
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
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'cep-engine-service-key')

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
cep_rules = {}
rule_id_counter = 1
active_patterns = {}

class CEPRule:
    """CEP Rule class for managing complex event processing rules"""
    
    def __init__(self, rule_id, name, pattern, action, conditions=None, enabled=True):
        self.rule_id = rule_id
        self.name = name
        self.pattern = pattern
        self.action = action
        self.conditions = conditions or {}
        self.created_at = datetime.utcnow().isoformat()
        self.last_triggered = None
        self.trigger_count = 0
        self.enabled = enabled
    
    def to_dict(self):
        return {
            'rule_id': self.rule_id,
            'name': self.name,
            'pattern': self.pattern,
            'action': self.action,
            'conditions': self.conditions,
            'created_at': self.created_at,
            'last_triggered': self.last_triggered,
            'trigger_count': self.trigger_count,
            'enabled': self.enabled
        }
    
    def evaluate(self, event_data):
        """Evaluate if the rule should be triggered based on event data"""
        try:
            # Simple pattern matching (can be extended with more sophisticated logic)
            if self.pattern == 'price_spike':
                return self._evaluate_price_spike(event_data)
            elif self.pattern == 'volume_surge':
                return self._evaluate_volume_surge(event_data)
            elif self.pattern == 'arbitrage_opportunity':
                return self._evaluate_arbitrage_opportunity(event_data)
            elif self.pattern == 'trend_reversal':
                return self._evaluate_trend_reversal(event_data)
            else:
                return self._evaluate_custom_pattern(event_data)
        
        except Exception as e:
            logger.error(f"Error evaluating rule {self.rule_id}: {e}")
            return False
    
    def _evaluate_price_spike(self, event_data):
        """Evaluate price spike pattern"""
        symbol = event_data.get('symbol')
        price = event_data.get('price', 0)
        threshold = self.conditions.get('price_change_threshold', 5.0)  # 5% default
        
        # Get previous price from Redis
        if redis_client:
            prev_price_data = redis_client.hgetall(f"price:{symbol}")
            if prev_price_data and 'price' in prev_price_data:
                prev_price = float(prev_price_data['price'])
                if prev_price > 0:
                    price_change = ((price - prev_price) / prev_price) * 100
                    return abs(price_change) >= threshold
        
        return False
    
    def _evaluate_volume_surge(self, event_data):
        """Evaluate volume surge pattern"""
        volume = event_data.get('volume', 0)
        threshold = self.conditions.get('volume_threshold', 1000000)  # 1M default
        return volume >= threshold
    
    def _evaluate_arbitrage_opportunity(self, event_data):
        """Evaluate arbitrage opportunity pattern"""
        spread = event_data.get('spread_percentage', 0)
        threshold = self.conditions.get('spread_threshold', 0.1)  # 0.1% default
        return spread >= threshold
    
    def _evaluate_trend_reversal(self, event_data):
        """Evaluate trend reversal pattern"""
        # This would require historical data analysis
        # For now, return False
        return False
    
    def _evaluate_custom_pattern(self, event_data):
        """Evaluate custom pattern using regex or other logic"""
        custom_condition = self.conditions.get('custom_condition')
        if custom_condition:
            # Simple string matching for now
            return custom_condition in str(event_data)
        return False
    
    def trigger(self, event_data):
        """Trigger the rule action"""
        self.last_triggered = datetime.utcnow().isoformat()
        self.trigger_count += 1
        
        # Execute action
        if self.action == 'create_signal':
            self._create_signal(event_data)
        elif self.action == 'send_alert':
            self._send_alert(event_data)
        elif self.action == 'log_event':
            self._log_event(event_data)
        
        logger.info(f"🚨 CEP Rule triggered: {self.name} (ID: {self.rule_id})")
    
    def _create_signal(self, event_data):
        """Create arbitrage signal"""
        if redis_client:
            signal = {
                'rule_id': self.rule_id,
                'rule_name': self.name,
                'pattern': self.pattern,
                'event_data': event_data,
                'timestamp': datetime.utcnow().isoformat(),
                'severity': 'high' if self.trigger_count > 5 else 'medium'
            }
            
            # Publish to Redis channel
            redis_client.publish('cep_signals', json.dumps(signal))
    
    def _send_alert(self, event_data):
        """Send alert (placeholder for notification system)"""
        alert = {
            'type': 'cep_alert',
            'rule_id': self.rule_id,
            'rule_name': self.name,
            'message': f"CEP Rule '{self.name}' triggered",
            'event_data': event_data,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if redis_client:
            redis_client.publish('alerts', json.dumps(alert))
    
    def _log_event(self, event_data):
        """Log event (placeholder for logging system)"""
        log_entry = {
            'level': 'INFO',
            'service': 'CEP Engine',
            'rule_id': self.rule_id,
            'rule_name': self.name,
            'event_data': event_data,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if redis_client:
            redis_client.publish('logs', json.dumps(log_entry))

def process_event(event_data):
    """Process incoming event through all CEP rules"""
    try:
        triggered_rules = []
        
        for rule in cep_rules.values():
            if not getattr(rule, 'enabled', True):
                continue
            if rule.evaluate(event_data):
                rule.trigger(event_data)
                triggered_rules.append(rule.rule_id)
        
        if triggered_rules:
            logger.info(f"📊 Event processed: {len(triggered_rules)} rules triggered")
        
        return triggered_rules
    
    except Exception as e:
        logger.error(f"Error processing event: {e}")
        return []

def cep_processing_thread():
    """Background thread for processing events from Redis"""
    if not redis_client:
        return
    
    pubsub = redis_client.pubsub()
    pubsub.subscribe('events', 'price_updates', 'arbitrage_signals')
    
    logger.info("👂 CEP Engine listening for events...")
    
    for message in pubsub.listen():
        if message['type'] == 'message':
            try:
                event_data = json.loads(message['data'])
                logger.info(f"📊 Processing event: {event_data.get('type', 'unknown')}")
                
                # Process through CEP rules
                triggered_rules = process_event(event_data)
                
                if triggered_rules:
                    logger.info(f"🚨 Rules triggered: {triggered_rules}")
                
            except Exception as e:
                logger.error(f"Error processing event: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'service': 'CEP Engine Service',
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'active_rules': len(cep_rules),
        'redis_connected': redis_client is not None
    })

@app.route('/rules', methods=['GET'])
def get_rules():
    """Get all CEP rules"""
    rules_list = [rule.to_dict() for rule in cep_rules.values()]
    
    return jsonify({
        'rules': rules_list,
        'count': len(rules_list),
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/rules', methods=['POST'])
def create_rule():
    """Create a new CEP rule"""
    global rule_id_counter
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'pattern', 'action']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new rule
        rule = CEPRule(
            rule_id=rule_id_counter,
            name=data['name'],
            pattern=data['pattern'],
            action=data['action'],
            conditions=data.get('conditions', {}),
            enabled=data.get('enabled', True)
        )
        
        cep_rules[rule_id_counter] = rule
        rule_id_counter += 1
        
        # Store in Redis
        if redis_client:
            redis_client.hset('cep_rules', rule.rule_id, json.dumps(rule.to_dict()))
        
        logger.info(f"✅ CEP Rule created: {rule.name} (ID: {rule.rule_id})")
        
        return jsonify({
            'message': 'Rule created successfully',
            'rule': rule.to_dict()
        }), 201
    
    except Exception as e:
        logger.error(f"Error creating rule: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/rules/<int:rule_id>', methods=['GET'])
def get_rule(rule_id):
    """Get a specific CEP rule"""
    if rule_id not in cep_rules:
        return jsonify({'error': 'Rule not found'}), 404
    
    return jsonify(cep_rules[rule_id].to_dict())

@app.route('/rules/<int:rule_id>', methods=['PUT'])
def update_rule(rule_id):
    """Update a CEP rule"""
    try:
        if rule_id not in cep_rules:
            return jsonify({'error': 'Rule not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        rule = cep_rules[rule_id]
        
        # Update fields
        if 'name' in data:
            rule.name = data['name']
        if 'pattern' in data:
            rule.pattern = data['pattern']
        if 'action' in data:
            rule.action = data['action']
        if 'conditions' in data:
            rule.conditions = data['conditions']
        if 'enabled' in data:
            rule.enabled = data['enabled']
        
        # Update in Redis
        if redis_client:
            redis_client.hset('cep_rules', rule_id, json.dumps(rule.to_dict()))
        
        logger.info(f"✅ CEP Rule updated: {rule.name} (ID: {rule_id})")
        
        return jsonify({
            'message': 'Rule updated successfully',
            'rule': rule.to_dict()
        })
    
    except Exception as e:
        logger.error(f"Error updating rule: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/rules/<int:rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    """Delete a CEP rule"""
    try:
        if rule_id not in cep_rules:
            return jsonify({'error': 'Rule not found'}), 404
        
        rule = cep_rules.pop(rule_id)
        
        # Remove from Redis
        if redis_client:
            redis_client.hdel('cep_rules', rule_id)
        
        logger.info(f"✅ CEP Rule deleted: {rule.name} (ID: {rule_id})")
        
        return jsonify({
            'message': 'Rule deleted successfully',
            'rule': rule.to_dict()
        })
    
    except Exception as e:
        logger.error(f"Error deleting rule: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/rules/<int:rule_id>/test', methods=['POST'])
def test_rule(rule_id):
    """Test a CEP rule with sample data"""
    try:
        if rule_id not in cep_rules:
            return jsonify({'error': 'Rule not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No test data provided'}), 400
        
        rule = cep_rules[rule_id]
        result = rule.evaluate(data)
        
        return jsonify({
            'rule_id': rule_id,
            'rule_name': rule.name,
            'test_data': data,
            'result': result,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error testing rule: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get CEP engine statistics"""
    total_triggers = sum(rule.trigger_count for rule in cep_rules.values())
    active_rules = len([rule for rule in cep_rules.values() if rule.trigger_count > 0])
    
    return jsonify({
        'total_rules': len(cep_rules),
        'active_rules': active_rules,
        'total_triggers': total_triggers,
        'average_triggers_per_rule': total_triggers / len(cep_rules) if cep_rules else 0,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/')
def service_info():
    """Service information"""
    return jsonify({
        'service': 'ASCEP CEP Engine Service',
        'version': '1.0.0',
        'description': 'Complex Event Processing engine for pattern detection',
        'endpoints': {
            '/health': 'Health check',
            '/rules': 'Get/create CEP rules',
            '/rules/<id>': 'Get/update/delete specific rule',
            '/rules/<id>/test': 'Test rule with sample data',
            '/stats': 'CEP engine statistics'
        },
        'active_rules': len(cep_rules),
        'supported_patterns': ['price_spike', 'volume_surge', 'arbitrage_opportunity', 'trend_reversal', 'custom']
    })

if __name__ == '__main__':
    logger.info("🚀 Starting ASCEP CEP Engine Service...")
    
    # Load existing rules from Redis
    if redis_client:
        try:
            stored_rules = redis_client.hgetall('cep_rules')
            for rule_id, rule_data in stored_rules.items():
                rule_dict = json.loads(rule_data)
                rule = CEPRule(
                    rule_id=int(rule_dict['rule_id']),
                    name=rule_dict['name'],
                    pattern=rule_dict['pattern'],
                    action=rule_dict['action'],
                    conditions=rule_dict.get('conditions', {}),
                    enabled=rule_dict.get('enabled', True)
                )
                rule.last_triggered = rule_dict.get('last_triggered')
                rule.trigger_count = rule_dict.get('trigger_count', 0)
                cep_rules[rule.rule_id] = rule
            
            logger.info(f"📊 Loaded {len(cep_rules)} rules from Redis")
        except Exception as e:
            logger.error(f"Error loading rules from Redis: {e}")
    
    # Start event processing thread
    processing_thread = threading.Thread(target=cep_processing_thread, daemon=True)
    processing_thread.start()
    
    logger.info("✅ CEP Engine service started!")
    app.run(host='0.0.0.0', port=5004, debug=False) 