#!/bin/bash

# ASCEP Monorepo Railway Deployment
echo "🚀 Starting ASCEP Monorepo on Railway..."

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