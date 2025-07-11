#!/bin/bash

echo "🚀 Deploying ASCEP Frontend to Vercel"
echo "====================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    pnpm add -g vercel
fi

# Get Railway app URL
echo "🔗 Please enter your Railway backend URL (e.g., https://your-app.railway.app):"
read RAILWAY_URL

# Update vercel.json with the correct backend URL
echo "⚙️ Updating Vercel configuration..."
sed -i "s|https://your-railway-app.railway.app|$RAILWAY_URL|g" vercel.json

# Set environment variable
echo "🔧 Setting environment variables..."
export REACT_APP_API_URL=$RAILWAY_URL

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
cd frontend
vercel --prod

echo ""
echo "✅ Frontend deployed successfully!"
echo "🌐 Your Vercel URL will be shown above"
echo "🔗 Backend API: $RAILWAY_URL"
echo ""
echo "📊 To check if everything is working:"
echo "   - Visit your Vercel URL"
echo "   - Check the health endpoint: $RAILWAY_URL/api/health" 