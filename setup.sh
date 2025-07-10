#!/bin/bash

# ASCEP Setup Script
# Real-time Complex Event Processing Platform for Arbitrage Signals

set -e

echo "🚀 Setting up ASCEP - Arbitrage Signal Complex Event Processing Platform"
echo "=================================================================="

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
echo "🐍 Python version: $PYTHON_VERSION"

if [[ $(echo "$PYTHON_VERSION >= 3.12" | bc -l) -eq 1 ]]; then
    echo "✅ Python version is compatible"
else
    echo "⚠️  Python version $PYTHON_VERSION detected. Python 3.12+ is recommended for better compatibility."
    echo "   Consider upgrading to Python 3.12 if you encounter package installation issues."
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo "⚠️  Redis is not running. Please start Redis:"
    echo "   redis-server"
    echo "   Or install Redis if not installed:"
    echo "   sudo apt-get install redis-server  # Ubuntu/Debian"
    echo "   brew install redis                 # macOS"
fi

# Backend setup
echo "📦 Setting up backend dependencies (latest versions)..."
cd backend

# Install latest versions
if pip install -r requirements.txt; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "⚠️  Installation failed, trying minimal requirements..."
    if pip install -r requirements-minimal.txt; then
        echo "✅ Backend dependencies installed (minimal version)"
    else
        echo "❌ Backend installation failed"
        echo "💡 Try upgrading to Python 3.12 for better compatibility"
        exit 1
    fi
fi

cd ..

# Frontend setup
echo "📦 Setting up frontend dependencies..."
cd frontend

if pnpm install; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Frontend installation failed"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "1. Start Redis (if not already running):"
echo "   redis-server"
echo ""
echo "2. Start the backend (in one terminal):"
echo "   cd backend"
echo "   python app.py"
echo ""
echo "3. Start the Celery worker (in another terminal):"
echo "   cd backend"
echo "   celery -A celery_worker.celery_app worker --loglevel=info"
echo ""
echo "4. Start the frontend (in another terminal):"
echo "   cd frontend"
echo "   pnpm start"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📊 System Design Features:"
echo "   • Real-time WebSocket connections"
echo "   • Distributed event processing with Celery"
echo "   • Redis-based caching and message queuing"
echo "   • Multi-source price feed integration"
echo "   • Complex Event Processing (CEP) rules engine" 