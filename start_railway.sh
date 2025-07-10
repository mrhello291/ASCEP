#!/bin/bash

# ASCEP Railway Deployment Script
echo "🚀 Starting ASCEP on Railway..."

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

# Start backend only (frontend is served as static files)
echo "🔧 Starting backend..."
cd backend
python app.py 