#!/bin/bash

# Get port from environment variable
PORT=${PORT:-5000}

echo "================================================================================
🚀 STARTING ASCEP SERVICES
================================================================================"

echo "📋 Environment Configuration:"
echo "  PORT: ${PORT} (Railway external port)"
echo "  REDIS_URL: ${REDIS_URL:+SET}"
echo "  DEBUG: ${DEBUG}"
echo "  Note: API Gateway listens directly on ${PORT}, other services use internal ports"

# Export environment variables for all services
export API_GATEWAY_URL="http://localhost:${PORT}"
export RAILWAY_ENVIRONMENT=true
# Note: DOCKER_COMPOSE is not set, so services will use localhost

echo "🔧 Service Configuration:"
echo "  API_GATEWAY_URL: ${API_GATEWAY_URL} (direct access)"
echo "  RAILWAY_ENVIRONMENT: ${RAILWAY_ENVIRONMENT}"
echo "  DOCKER_COMPOSE: [NOT SET - using localhost for service communication]"

echo "================================================================================
Starting supervisor with all services...
================================================================================"

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf 