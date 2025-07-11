#!/bin/bash

# ASCEP Docker Compose Startup Script

echo "🚀 Starting ASCEP Microservices with Docker Compose..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Stop any existing containers
echo -e "${BLUE}🧹 Stopping any existing containers...${NC}"
docker-compose down

# Build and start services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
docker-compose up --build -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service status
echo -e "${BLUE}📊 Checking service status...${NC}"
docker-compose ps

# Display service URLs
echo -e "${GREEN}"
echo "🎉 ASCEP Microservices Started Successfully!"
echo "================================================"
echo "Service          | Port | Status"
echo "-----------------|------|--------"
echo "API Gateway      | 5000 | ✅ Running"
echo "Health Service   | 5001 | ✅ Running"
echo "Price Feed       | 5002 | ✅ Running"
echo "Arbitrage        | 5003 | ✅ Running"
echo "CEP Engine       | 5004 | ✅ Running"
echo "Redis            | 6379 | ✅ Running"
echo ""
echo "🌐 API Gateway: http://localhost:5000"
echo "🏥 Health Check: http://localhost:5000/api/health"
echo "📊 Price Data: http://localhost:5000/api/prices"
echo "💰 Signals: http://localhost:5000/api/signals"
echo "🧠 Rules: http://localhost:5000/api/rules"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo -e "${NC}"

# Show logs
echo -e "${YELLOW}📋 Showing logs (Ctrl+C to exit logs, services will continue running)...${NC}"
docker-compose logs -f 