"""
ASCEP API Gateway - Service Registry
Easy configuration for adding new services
"""

import os
from typing import Dict, List, Optional

class ServiceRegistry:
    """Service registry for API Gateway routing"""
    
    def __init__(self):
        self.services = {}
        self._load_default_services()
    
    def _load_default_services(self):
        """Load default service configurations"""
        self.register_service(
            name="health",
            port=5001,
            endpoints=["/health", "/status", "/metrics"],
            description="Health monitoring service"
        )
        
        self.register_service(
            name="price_feed",
            port=5002,
            endpoints=["/prices", "/health"],
            description="Price data service"
        )
        
        self.register_service(
            name="arbitrage",
            port=5003,
            endpoints=["/signals", "/stats", "/health"],
            description="Arbitrage detection service"
        )
        
        self.register_service(
            name="cep_engine",
            port=5004,
            endpoints=["/rules", "/stats", "/health"],
            description="Complex event processing service"
        )
        
        self.register_service(
            name="celery_worker",
            port=5005,
            endpoints=["/health", "/tasks", "/stats"],
            description="Background task processing service"
        )
    
    def register_service(self, name: str, port: int, endpoints: List[str], 
                        description: str = "", health_endpoint: str = "/health"):
        """Register a new service"""
        self.services[name] = {
            'name': name,
            'port': port,
            'endpoints': endpoints,
            'description': description,
            'health_endpoint': health_endpoint,
            'enabled': True
        }
    
    def get_service_url(self, service_name: str) -> Optional[str]:
        """Get service URL based on environment"""
        if service_name not in self.services:
            return None
        
        service = self.services[service_name]
        if not service['enabled']:
            return None
        
        # Check if running in Docker Compose
        if os.getenv('DOCKER_COMPOSE'):
            # Use service names as hostnames in Docker Compose
            service_hostnames = {
                'health': 'health',
                'price_feed': 'price_feeds',
                'arbitrage': 'arbitrage',
                'cep_engine': 'cep_engine',
                'celery_worker': 'celery_worker'
            }
            hostname = service_hostnames.get(service_name, service_name)
            return f"http://{hostname}:{service['port']}"
        # Check if running in Railway/production
        elif os.getenv('RAILWAY_ENVIRONMENT'):
            return f"http://localhost:{service['port']}"
        else:
            return f"http://localhost:{service['port']}"
    
    def get_all_services(self) -> Dict:
        """Get all registered services"""
        return self.services
    
    def enable_service(self, service_name: str):
        """Enable a service"""
        if service_name in self.services:
            self.services[service_name]['enabled'] = True
    
    def disable_service(self, service_name: str):
        """Disable a service"""
        if service_name in self.services:
            self.services[service_name]['enabled'] = False
    
    def get_service_info(self, service_name: str) -> Optional[Dict]:
        """Get service information"""
        return self.services.get(service_name)

# Global service registry instance
service_registry = ServiceRegistry() 