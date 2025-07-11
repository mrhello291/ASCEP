"""
ASCEP API Gateway - Latency Monitor
Track and monitor latency across all services
"""

import time
import json
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import defaultdict, deque
import redis

class LatencyMonitor:
    """Monitor latency across all services and endpoints"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.latency_data = defaultdict(lambda: deque(maxlen=1000))  # Keep last 1000 measurements
        self.request_counters = defaultdict(int)
        self.error_counters = defaultdict(int)
        self.lock = threading.Lock()
        
        # Start background thread for metrics aggregation
        self.running = True
        self.metrics_thread = threading.Thread(target=self._metrics_aggregator, daemon=True)
        self.metrics_thread.start()
    
    def record_request(self, service_name: str, endpoint: str, method: str, 
                      latency_ms: float, status_code: int, success: bool = True):
        """Record a request with its latency"""
        with self.lock:
            key = f"{service_name}:{endpoint}:{method}"
            
            # Record latency
            self.latency_data[key].append({
                'timestamp': datetime.utcnow().isoformat(),
                'latency_ms': latency_ms,
                'status_code': status_code,
                'success': success
            })
            
            # Update counters
            self.request_counters[key] += 1
            if not success:
                self.error_counters[key] += 1
            
            # Store in Redis for persistence
            if self.redis_client:
                try:
                    redis_key = f"latency:{key}"
                    self.redis_client.hset(redis_key, 'last_latency', latency_ms)
                    self.redis_client.hset(redis_key, 'request_count', self.request_counters[key])
                    self.redis_client.hset(redis_key, 'error_count', self.error_counters[key])
                    self.redis_client.hset(redis_key, 'last_update', datetime.utcnow().isoformat())
                    self.redis_client.expire(redis_key, 3600)  # 1 hour expiry
                except Exception as e:
                    print(f"Error storing latency data in Redis: {e}")
    
    def get_latency_stats(self, service_name: str = None, endpoint: str = None) -> Dict:
        """Get latency statistics"""
        with self.lock:
            stats = {
                'overall': self._calculate_stats(),
                'services': {},
                'endpoints': {}
            }
            
            # Service-specific stats
            if service_name:
                service_stats = {}
                for key, data in self.latency_data.items():
                    if key.startswith(f"{service_name}:"):
                        service_stats[key] = self._calculate_stats_for_data(data)
                stats['services'][service_name] = service_stats
            
            # Endpoint-specific stats
            if endpoint:
                endpoint_stats = {}
                for key, data in self.latency_data.items():
                    if f":{endpoint}:" in key:
                        endpoint_stats[key] = self._calculate_stats_for_data(data)
                stats['endpoints'][endpoint] = endpoint_stats
            
            return stats
    
    def _calculate_stats(self) -> Dict:
        """Calculate overall statistics"""
        all_latencies = []
        total_requests = 0
        total_errors = 0
        
        for key, data in self.latency_data.items():
            latencies = [item['latency_ms'] for item in data]
            all_latencies.extend(latencies)
            total_requests += self.request_counters[key]
            total_errors += self.error_counters[key]
        
        if not all_latencies:
            return {
                'avg_latency_ms': 0,
                'min_latency_ms': 0,
                'max_latency_ms': 0,
                'p95_latency_ms': 0,
                'p99_latency_ms': 0,
                'total_requests': 0,
                'error_rate': 0
            }
        
        sorted_latencies = sorted(all_latencies)
        p95_index = int(len(sorted_latencies) * 0.95)
        p99_index = int(len(sorted_latencies) * 0.99)
        
        return {
            'avg_latency_ms': sum(all_latencies) / len(all_latencies),
            'min_latency_ms': min(all_latencies),
            'max_latency_ms': max(all_latencies),
            'p95_latency_ms': sorted_latencies[p95_index] if p95_index < len(sorted_latencies) else max(all_latencies),
            'p99_latency_ms': sorted_latencies[p99_index] if p99_index < len(sorted_latencies) else max(all_latencies),
            'total_requests': total_requests,
            'error_rate': (total_errors / total_requests * 100) if total_requests > 0 else 0
        }
    
    def _calculate_stats_for_data(self, data: deque) -> Dict:
        """Calculate statistics for specific data"""
        if not data:
            return {'avg_latency_ms': 0, 'min_latency_ms': 0, 'max_latency_ms': 0}
        
        latencies = [item['latency_ms'] for item in data]
        return {
            'avg_latency_ms': sum(latencies) / len(latencies),
            'min_latency_ms': min(latencies),
            'max_latency_ms': max(latencies),
            'count': len(latencies)
        }
    
    def get_recent_latency(self, service_name: str, endpoint: str, method: str = "GET", 
                          minutes: int = 5) -> List[Dict]:
        """Get recent latency data for a specific endpoint"""
        with self.lock:
            key = f"{service_name}:{endpoint}:{method}"
            data = self.latency_data[key]
            
            cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
            recent_data = []
            
            for item in data:
                item_time = datetime.fromisoformat(item['timestamp'])
                if item_time >= cutoff_time:
                    recent_data.append(item)
            
            return recent_data
    
    def _metrics_aggregator(self):
        """Background thread for aggregating metrics"""
        while self.running:
            try:
                # Aggregate metrics every 30 seconds
                time.sleep(30)
                
                if self.redis_client:
                    stats = self.get_latency_stats()
                    self.redis_client.set('gateway_latency_stats', json.dumps(stats), ex=300)
                    
            except Exception as e:
                print(f"Error in metrics aggregator: {e}")
    
    def stop(self):
        """Stop the latency monitor"""
        self.running = False
        if self.metrics_thread.is_alive():
            self.metrics_thread.join()

# Global latency monitor instance
latency_monitor = None 