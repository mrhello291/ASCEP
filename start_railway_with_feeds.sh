#!/bin/bash

# ASCEP Railway Deployment with Price Feeds
echo "🚀 Starting ASCEP with Price Feeds on Railway..."

# Set environment variables
export PORT=${PORT:-5000}
export DEBUG=${DEBUG:-False}

echo "📊 Using port: $PORT"
echo "🐛 Debug mode: $DEBUG"

# Build frontend if not already built
if [ ! -d "frontend/build" ]; then
    echo "🔨 Building frontend..."
    cd frontend
    npm install -g pnpm
    pnpm install --frozen-lockfile
    pnpm run build
    cd ..
fi

# Start price feeds in background
echo "📈 Starting price feeds in background..."
cd services/price_feeds
python price_feed_service.py &
PRICE_FEED_PID=$!
cd ../..

# Wait a moment for price feeds to start
sleep 3

# Start backend
echo "🔧 Starting backend..."
cd backend
python app.py 