#!/bin/bash

# ASCEP Services Startup Script
echo "🚀 Starting ASCEP Services..."

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "❌ Redis is not running. Please start Redis first:"
    echo "   redis-server"
    exit 1
fi

echo "✅ Redis is running"

# Function to start a service
start_service() {
    local name=$1
    local command=$2
    local dir=$3
    
    echo "🔄 Starting $name..."
    cd "$dir" && $command &
    echo "✅ $name started (PID: $!)"
}

# Start services
start_service "Backend" "python app.py" "backend"
sleep 2

start_service "Celery Worker" "celery -A celery_worker.celery_app worker --loglevel=info" "backend"
sleep 2

start_service "Frontend" "pnpm start" "frontend"

echo ""
echo "🎉 All ASCEP services are starting!"
echo ""
echo "📊 Services Status:"
echo "   • Redis: Running"
echo "   • Backend: Starting on http://localhost:5000"
echo "   • Celery Worker: Starting"
echo "   • Frontend: Starting on http://localhost:3000"
echo ""
echo "⏳ Please wait a moment for all services to fully start..."
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait 