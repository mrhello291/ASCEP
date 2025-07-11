#!/bin/bash

# ASCEP Monorepo Railway Deployment
echo "🚀 Starting ASCEP Monorepo on Railway..."

# Set environment variables
export PORT=${PORT:-5000}
export DEBUG=${DEBUG:-False}

echo "📊 Using port: $PORT"
echo "🐛 Debug mode: $DEBUG"

# Check if Redis is available
echo "🔍 Checking Redis availability..."
if [ -n "$REDIS_URL" ]; then
    echo "✅ Redis URL found: ${REDIS_URL:0:20}..."
elif [ -n "$REDIS_HOST" ]; then
    echo "✅ Redis host found: $REDIS_HOST:$REDIS_PORT"
else
    echo "⚠️ No Redis configuration found"
    echo "💡 The app will run without Redis (some features limited)"
fi

# Build frontend if not already built
if [ ! -d "frontend/build" ]; then
    echo "🔨 Building frontend..."
    cd frontend
    npm install -g pnpm
    pnpm install --frozen-lockfile
    pnpm run build
    cd ..
fi

# Function to start price feeds in background
start_price_feeds() {
    echo "📈 Starting price feeds in background..."
    cd services/price_feeds
    python price_feed_service.py &
    PRICE_FEED_PID=$!
    echo "✅ Price feeds started with PID: $PRICE_FEED_PID"
    cd ../..
}

# Function to start backend
start_backend() {
    echo "🔧 Starting backend..."
    cd backend
    python app.py
}

# Start price feeds in background
start_price_feeds

# Wait a moment for price feeds to initialize
echo "⏳ Waiting for price feeds to initialize..."
sleep 5

# Start backend (this will be the main process)
start_backend 