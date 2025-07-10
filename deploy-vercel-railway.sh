#!/bin/bash

# ASCEP Vercel + Railway Quick Deploy Script
echo "🚀 ASCEP Vercel + Railway Deployment"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found!"
    echo "Please initialize git and push to GitHub first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin https://github.com/yourusername/ASCEP.git"
    echo "   git push -u origin main"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Git remote not configured!"
    echo "Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/ASCEP.git"
    exit 1
fi

echo "✅ Git repository configured"

# Push latest changes
echo "📤 Pushing latest changes to GitHub..."
git add .
git commit -m "Deploy to Vercel + Railway"
git push origin main

echo ""
echo "🎉 Code pushed to GitHub!"
echo "====================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  DEPLOY BACKEND (Railway):"
echo "   • Go to https://railway.app"
echo "   • Sign up and create new project"
echo "   • Connect your GitHub repository"
echo "   • Add Redis service"
echo "   • Set environment variables:"
echo "     SECRET_KEY=your-secret-key"
echo "     REDIS_HOST=your-redis-host"
echo "     REDIS_PORT=6379"
echo "     DEBUG=False"
echo "     PORT=5000"
echo ""
echo "2️⃣  DEPLOY FRONTEND (Vercel):"
echo "   • Go to https://vercel.com"
echo "   • Sign up and import project"
echo "   • Set Root Directory: frontend"
echo "   • Set environment variable:"
echo "     REACT_APP_API_URL=https://your-railway-url.railway.app"
echo ""
echo "3️⃣  UPDATE CONFIGURATION:"
echo "   • Update vercel.json with your Railway URL"
echo "   • Redeploy frontend"
echo ""
echo "🌐 Your ASCEP platform will be live!"
echo "=====================================" 