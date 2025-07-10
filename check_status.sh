#!/bin/bash

# ASCEP Services Status Check
echo "🔍 Checking ASCEP Services Status..."
echo ""

# Check Redis
if pgrep -x "redis-server" > /dev/null; then
    echo "✅ Redis: Running"
else
    echo "❌ Redis: Not running"
fi

# Check Backend (Flask)
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend: Running on http://localhost:5000"
else
    echo "❌ Backend: Not responding on http://localhost:5000"
fi

# Check Frontend (React)
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: Running on http://localhost:3000"
else
    echo "❌ Frontend: Not responding on http://localhost:3000"
fi

# Check Celery Worker
if pgrep -f "celery.*worker" > /dev/null; then
    echo "✅ Celery Worker: Running"
else
    echo "❌ Celery Worker: Not running"
fi

echo ""
echo "📊 Quick Health Check:"
if curl -s http://localhost:5000/api/health | grep -q "healthy"; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
fi

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000/api/health"
echo "" 