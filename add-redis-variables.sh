#!/bin/bash

echo "🔴 Adding Redis variables to Railway..."
echo "======================================"

# Add Redis URL (main connection string)
echo "Adding REDIS_URL..."
railway variables set REDIS_URL='${{ Redis.REDIS_URL }}'

# Add individual Redis variables for more control
echo "Adding REDIS_HOST..."
railway variables set REDIS_HOST='${{ Redis.REDISHOST }}'

echo "Adding REDIS_PORT..."
railway variables set REDIS_PORT='${{ Redis.REDISPORT }}'

echo "Adding REDIS_PASSWORD..."
railway variables set REDIS_PASSWORD='${{ Redis.REDISPASSWORD }}'

echo "Adding REDIS_USER..."
railway variables set REDIS_USER='${{ Redis.REDISUSER }}'

echo "✅ Redis variables added successfully!"
echo ""
echo "🚀 Redeploying your app..."
railway up

echo ""
echo "🎉 Your ASCEP app should now be connected to Redis!"
echo "📊 Check health at: https://your-app.railway.app/api/health" 