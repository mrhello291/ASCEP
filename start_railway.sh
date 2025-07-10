#!/bin/bash

# ASCEP Railway Deployment Script
echo "🚀 Starting ASCEP on Railway..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r backend/requirements.txt

echo "📦 Installing Node.js dependencies..."
cd frontend && npm install && cd ..

# Start Redis (Railway provides this as a service)
echo "🔴 Redis will be provided by Railway service"

# Start backend
echo "🔧 Starting backend..."
cd backend && python app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 10

# Start Celery worker
echo "⚡ Starting Celery worker..."
cd backend && celery -A celery_worker.celery_app worker --loglevel=info &
CELERY_PID=$!

# Wait for Celery to start
sleep 5

# Start frontend
echo "🌐 Starting frontend..."
cd frontend && npm start &
FRONTEND_PID=$!

echo "✅ ASCEP started successfully!"
echo "📊 Backend: $PORT"
echo "🌐 Frontend: $PORT (React will redirect)"

# Keep the script running
wait 