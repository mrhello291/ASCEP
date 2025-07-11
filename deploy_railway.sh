#!/bin/bash

# ASCEP Railway Docker Deployment Script

echo "🚀 Starting ASCEP Railway Docker Deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please login first:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"

# Initialize Railway project if not already done
if [ ! -f ".railway" ]; then
    echo "📋 Initializing Railway project..."
    railway init
fi

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set SECRET_KEY=$(openssl rand -hex 32)

echo "📦 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your Railway URL: $(railway domain)"

echo ""
echo "📋 Next steps:"
echo "1. Copy your Railway URL"
echo "2. Deploy frontend to Vercel with REACT_APP_API_URL set to your Railway URL"
echo "3. Test your deployment at: $(railway domain)" 