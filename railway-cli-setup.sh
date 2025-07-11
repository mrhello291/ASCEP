#!/bin/bash

# ASCEP Railway Multi-Service Setup
echo "🚀 Setting up ASCEP with multiple Railway services..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Create main project
echo "📦 Creating main ASCEP project..."
railway init --name "ascep-backend"

# Add backend service
echo "🔧 Adding backend service..."
railway service create --name "backend" --start-command "cd backend && python app.py"

# Add price feeds service
echo "📈 Adding price feeds service..."
railway service create --name "price-feeds" --start-command "cd services/price_feeds && python price_feed_service.py"

# Add Redis service
echo "🔴 Adding Redis service..."
railway service create --name "redis" --image "redis:7-alpine"

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set REDIS_HOST=redis
railway variables set REDIS_PORT=6379
railway variables set DEBUG=False
railway variables set PORT=5000

# Deploy all services
echo "🚀 Deploying all services..."
railway up

echo "✅ ASCEP multi-service setup complete!"
echo "🌐 Check your Railway dashboard for the deployed services" 