#!/bin/bash

# ASCEP Microservices Startup Script
# Starts all microservices in the proper order

set -e

echo "🚀 Starting ASCEP Microservices Architecture..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}   Attempt $attempt/$max_attempts...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within timeout${NC}"
    return 1
}

# Kill any existing processes on our ports
echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"
pkill -f "python.*500[0-4]" || true
sleep 2

# Start services in order

# 1. Start Health Service (Port 5001)
echo -e "${BLUE}🏥 Starting Health Service...${NC}"
cd backend/services/health
python main.py &
HEALTH_PID=$!
cd ../../..

# Wait for health service
wait_for_service "Health Service" 5001

# 2. Start API Gateway (Port 5000) - Start early so other services can connect to it
echo -e "${BLUE}🌐 Starting API Gateway...${NC}"
cd backend/services/api_gateway
python main.py &
GATEWAY_PID=$!
cd ../../..

# Wait for API gateway
wait_for_service "API Gateway" 5000

# 3. Start Price Feed Service (Port 5002)
echo -e "${BLUE}📊 Starting Price Feed Service...${NC}"
cd backend/services/price_feeds
python main.py &
PRICE_FEED_PID=$!
cd ../../..

# Wait for price feed service with extra time for full initialization
wait_for_service "Price Feed Service" 5002
echo -e "${YELLOW}⏳ Waiting additional time for Price Feed Service to fully initialize...${NC}"
sleep 5

# 4. Start Arbitrage Service (Port 5003)
echo -e "${BLUE}💰 Starting Arbitrage Service...${NC}"
cd backend/services/arbitrage
python main.py &
ARBITRAGE_PID=$!
cd ../../..

# Wait for arbitrage service
wait_for_service "Arbitrage Service" 5003

# 5. Start CEP Engine Service (Port 5004)
echo -e "${BLUE}🧠 Starting CEP Engine Service...${NC}"
cd backend/services/cep_engine
python main.py &
CEP_ENGINE_PID=$!
cd ../../..

# Wait for CEP engine service
wait_for_service "CEP Engine Service" 5004

# Display service status
echo -e "${GREEN}"
echo "🎉 All ASCEP Microservices Started Successfully!"
echo "================================================"
echo "Service          | Port | Status"
echo "-----------------|------|--------"
echo "API Gateway      | 5000 | ✅ Running"
echo "Health Service   | 5001 | ✅ Running"
echo "Price Feed       | 5002 | ✅ Running"
echo "Arbitrage        | 5003 | ✅ Running"
echo "CEP Engine       | 5004 | ✅ Running"
echo ""
echo "🌐 API Gateway: http://localhost:5000"
echo "🏥 Health Check: http://localhost:5000/api/health"
echo "📊 Price Data: http://localhost:5000/api/prices"
echo "💰 Signals: http://localhost:5000/api/signals"
echo "🧠 Rules: http://localhost:5000/api/rules"
echo ""
echo "Press Ctrl+C to stop all services"
echo -e "${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    # Kill all background processes
    kill $GATEWAY_PID 2>/dev/null || true
    kill $HEALTH_PID 2>/dev/null || true
    kill $PRICE_FEED_PID 2>/dev/null || true
    kill $ARBITRAGE_PID 2>/dev/null || true
    kill $CEP_ENGINE_PID 2>/dev/null || true
    
    # Wait a moment for processes to terminate
    sleep 2
    
    # Force kill if still running
    pkill -f "python.*500[0-4]" || true
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running and monitor services
while true; do
    sleep 10
    
    # Check if all services are still running
    if ! check_port 5000; then
        echo -e "${RED}❌ API Gateway stopped unexpectedly${NC}"
        break
    fi
    
    if ! check_port 5001; then
        echo -e "${RED}❌ Health Service stopped unexpectedly${NC}"
        break
    fi
    
    if ! check_port 5002; then
        echo -e "${RED}❌ Price Feed Service stopped unexpectedly${NC}"
        break
    fi
    
    if ! check_port 5003; then
        echo -e "${RED}❌ Arbitrage Service stopped unexpectedly${NC}"
        break
    fi
    
    if ! check_port 5004; then
        echo -e "${RED}❌ CEP Engine Service stopped unexpectedly${NC}"
        break
    fi
    
    echo -e "${GREEN}✅ All services running normally${NC}"
done

# If we get here, something went wrong
echo -e "${RED}💥 One or more services stopped unexpectedly${NC}"
cleanup 