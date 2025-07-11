#!/bin/bash

# ASCEP Railway with Process Manager
echo "🚀 Starting ASCEP with process manager..."

# Install supervisor if not present
if ! command -v supervisord &> /dev/null; then
    echo "📦 Installing supervisor..."
    apt-get update && apt-get install -y supervisor
fi

# Create supervisor configuration
cat > /etc/supervisor/conf.d/ascep.conf << EOF
[program:ascep-backend]
command=cd /app/backend && python app.py
directory=/app
autostart=true
autorestart=true
stderr_logfile=/var/log/ascep-backend.err.log
stdout_logfile=/var/log/ascep-backend.out.log
environment=PORT=5000,DEBUG=False

[program:ascep-price-feeds]
command=cd /app/services/price_feeds && python price_feed_service.py
directory=/app
autostart=true
autorestart=true
stderr_logfile=/var/log/ascep-price-feeds.err.log
stdout_logfile=/var/log/ascep-price-feeds.out.log
environment=RAILWAY_STATIC_URL=http://localhost:5000

[program:ascep-celery]
command=cd /app/backend && celery -A celery_worker.celery_app worker --loglevel=info
directory=/app
autostart=true
autorestart=true
stderr_logfile=/var/log/ascep-celery.err.log
stdout_logfile=/var/log/ascep-celery.out.log
EOF

# Start supervisor
echo "🔧 Starting supervisor..."
supervisord -c /etc/supervisor/supervisord.conf

# Keep the container running
echo "✅ All services started. Monitoring logs..."
tail -f /var/log/supervisor/supervisord.log 