# ASCEP Troubleshooting Guide

Comprehensive troubleshooting guide for the ASCEP (Arbitrage Signal Complex Event Processing) platform.

## 🚨 Quick Diagnosis

### Health Check Commands
```bash
# Check all services health
curl http://localhost:5000/api/health

# Check individual services
curl http://localhost:5001/health
curl http://localhost:5002/health
curl http://localhost:5003/health
curl http://localhost:5004/health

# Check Redis connection
redis-cli ping

# Check Docker containers
docker-compose ps
```

## 🔧 Common Issues

### 1. Docker Issues

#### Problem: Docker containers won't start
**Symptoms**: `docker-compose up` fails or containers exit immediately

**Solutions**:
```bash
# Check Docker is running
docker --version
docker-compose --version

# Clean up and restart
docker-compose down
docker system prune -f
docker-compose up --build

# Check for port conflicts
netstat -tulpn | grep :5000
netstat -tulpn | grep :3000
```

#### Problem: Port already in use
**Symptoms**: `Error: Port 5000 is already in use`

**Solutions**:
```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different ports
# Edit docker-compose.yml and change port mappings
```

#### Problem: Docker build fails
**Symptoms**: Build errors during `docker-compose build`

**Solutions**:
```bash
# Clear Docker cache
docker builder prune -f

# Check Dockerfile syntax
docker build -f Dockerfile.railway . --no-cache

# Check for missing files
ls -la backend/requirements.txt
ls -la frontend/package.json
```

### 2. Backend Service Issues

#### Problem: API Gateway not responding
**Symptoms**: `curl http://localhost:5000/` returns connection refused

**Solutions**:
```bash
# Check if service is running
docker-compose logs api_gateway

# Check service dependencies
docker-compose logs redis
docker-compose logs health

# Restart service
docker-compose restart api_gateway

# Check environment variables
docker-compose exec api_gateway env | grep REDIS
```

#### Problem: Redis connection failed
**Symptoms**: `Redis connection failed` in logs

**Solutions**:
```bash
# Check Redis container
docker-compose logs redis
docker-compose exec redis redis-cli ping

# Check Redis configuration
docker-compose exec api_gateway cat /app/backend/services/api_gateway/api_gateway.py | grep REDIS

# Restart Redis
docker-compose restart redis
```

#### Problem: Price Feed Service not updating
**Symptoms**: No price updates in frontend

**Solutions**:
```bash
# Check WebSocket connections
docker-compose logs price_feeds

# Check Binance API status
curl https://api.binance.com/api/v3/ping

# Test WebSocket connection manually
wscat -c wss://stream.binance.com:9443/ws/btcusdt@trade

# Check Redis pub/sub
docker-compose exec redis redis-cli
> SUBSCRIBE price_updates
```

#### Problem: Arbitrage Service not generating signals
**Symptoms**: No arbitrage signals appearing

**Solutions**:
```bash
# Check arbitrage service logs
docker-compose logs arbitrage

# Check price data availability
curl http://localhost:5000/api/prices

# Check arbitrage configuration
docker-compose exec arbitrage cat /app/backend/services/arbitrage/arbitrage_service.py | grep -A 10 "class ArbitrageService"

# Test arbitrage detection manually
curl http://localhost:5003/signals
```

### 3. Frontend Issues

#### Problem: Frontend not loading
**Symptoms**: White screen or loading errors

**Solutions**:
```bash
# Check frontend container
docker-compose logs frontend

# Check build process
docker-compose exec frontend ls -la /app/build

# Check API connection
curl http://localhost:5000/api/health

# Check environment variables
docker-compose exec frontend env | grep REACT_APP
```

#### Problem: WebSocket connection failed
**Symptoms**: `WebSocket connection failed` in browser console

**Solutions**:
```bash
# Check WebSocket endpoint
curl -I http://localhost:5000

# Check CORS configuration
docker-compose logs api_gateway | grep CORS

# Test WebSocket manually
wscat -c ws://localhost:5000

# Check firewall settings
sudo ufw status
```

#### Problem: Real-time updates not working
**Symptoms**: Price updates not appearing in real-time

**Solutions**:
```bash
# Check WebSocket events
docker-compose logs api_gateway | grep "price_update"

# Check Redis pub/sub
docker-compose exec redis redis-cli
> PUBLISH price_updates '{"symbol":"BTC/USDT","price":45000}'

# Check frontend WebSocket subscription
# Open browser dev tools and check console for WebSocket messages
```

### 4. Network Issues

#### Problem: Services can't communicate
**Symptoms**: Inter-service communication failures

**Solutions**:
```bash
# Check Docker network
docker network ls
docker network inspect ascep_ascep_network

# Check service discovery
docker-compose exec api_gateway ping health
docker-compose exec api_gateway ping price_feeds

# Check DNS resolution
docker-compose exec api_gateway nslookup health
```

#### Problem: External API calls failing
**Symptoms**: Binance API or other external calls failing

**Solutions**:
```bash
# Check internet connectivity
docker-compose exec api_gateway ping google.com

# Check API rate limits
curl -I https://api.binance.com/api/v3/ticker/price

# Check proxy settings
docker-compose exec api_gateway env | grep -i proxy

# Test with different API endpoint
curl https://api.binance.com/api/v3/ping
```

### 5. Performance Issues

#### Problem: High latency
**Symptoms**: Slow response times

**Solutions**:
```bash
# Check service latency
curl http://localhost:5000/api/latency

# Check resource usage
docker stats

# Check Redis performance
docker-compose exec redis redis-cli --latency

# Check memory usage
docker-compose exec api_gateway free -h
```

#### Problem: Memory leaks
**Symptoms**: Increasing memory usage over time

**Solutions**:
```bash
# Monitor memory usage
watch -n 1 'docker stats --no-stream'

# Check for memory leaks in logs
docker-compose logs | grep -i memory
docker-compose logs | grep -i leak

# Restart services periodically
docker-compose restart
```

## 🔍 Debugging Techniques

### 1. Log Analysis

#### Enable Debug Logging
```bash
# Set debug environment variable
export DEBUG=true
export FLASK_DEBUG=1

# Restart services
docker-compose restart
```

#### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api_gateway
docker-compose logs -f price_feeds

# Last 100 lines
docker-compose logs --tail=100 api_gateway
```

#### Log Filtering
```bash
# Filter by error level
docker-compose logs api_gateway | grep ERROR

# Filter by specific error
docker-compose logs | grep "Redis connection"

# Filter by time
docker-compose logs --since="2024-01-01T00:00:00" api_gateway
```

### 2. Container Debugging

#### Access Container Shell
```bash
# Access running container
docker-compose exec api_gateway bash
docker-compose exec redis redis-cli

# Check container filesystem
docker-compose exec api_gateway ls -la /app
docker-compose exec api_gateway cat /app/backend/services/api_gateway/main.py
```

#### Check Container Health
```bash
# Container status
docker-compose ps

# Container details
docker inspect ascep_api_gateway_1

# Container resource usage
docker stats ascep_api_gateway_1
```

### 3. Network Debugging

#### Check Network Connectivity
```bash
# Test inter-service communication
docker-compose exec api_gateway curl http://health:5001/health
docker-compose exec api_gateway curl http://price_feeds:5002/health

# Check DNS resolution
docker-compose exec api_gateway nslookup health
docker-compose exec api_gateway nslookup redis
```

#### Test External Connectivity
```bash
# Test internet access
docker-compose exec api_gateway curl https://api.binance.com/api/v3/ping

# Test WebSocket connection
docker-compose exec api_gateway wscat -c wss://stream.binance.com:9443/ws/btcusdt@trade
```

### 4. Database Debugging

#### Redis Debugging
```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Check Redis info
docker-compose exec redis redis-cli info

# Check Redis keys
docker-compose exec redis redis-cli keys "*"

# Monitor Redis commands
docker-compose exec redis redis-cli monitor
```

#### Test Redis Operations
```bash
# Test basic operations
docker-compose exec redis redis-cli set test "hello"
docker-compose exec redis redis-cli get test

# Test pub/sub
docker-compose exec redis redis-cli
> SUBSCRIBE price_updates
> PUBLISH price_updates '{"test": "data"}'
```

## 🛠️ Recovery Procedures

### 1. Service Recovery

#### Restart Individual Service
```bash
# Restart specific service
docker-compose restart api_gateway
docker-compose restart price_feeds

# Check service health after restart
curl http://localhost:5000/api/health
```

#### Full System Restart
```bash
# Stop all services
docker-compose down

# Clean up
docker system prune -f

# Restart all services
docker-compose up -d

# Wait for services to be healthy
sleep 30
curl http://localhost:5000/api/health
```

### 2. Data Recovery

#### Redis Data Recovery
```bash
# Backup Redis data
docker-compose exec redis redis-cli BGSAVE

# Check Redis persistence
docker-compose exec redis redis-cli info persistence

# Restore from backup (if available)
docker-compose exec redis redis-cli
> CONFIG SET dir /data
> RESTORE key 0 value
```

#### Configuration Recovery
```bash
# Check configuration files
docker-compose exec api_gateway cat /app/supervisord.conf
docker-compose exec api_gateway cat /etc/supervisor/conf.d/supervisord.conf

# Restore from git
git checkout HEAD -- docker-compose.yml
git checkout HEAD -- supervisord.conf
```

### 3. Emergency Procedures

#### Emergency Shutdown
```bash
# Stop all services immediately
docker-compose down --remove-orphans

# Kill all containers
docker kill $(docker ps -q)

# Clean up
docker system prune -f
```

#### Emergency Restart
```bash
# Start essential services only
docker-compose up -d redis
docker-compose up -d api_gateway

# Check basic functionality
curl http://localhost:5000/api/health

# Start remaining services
docker-compose up -d
```

## 📊 Monitoring and Alerts

### 1. Health Monitoring

#### Automated Health Checks
```bash
# Create health check script
cat > health_check.sh << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:5000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ ASCEP is healthy"
else
    echo "❌ ASCEP health check failed: $RESPONSE"
    # Send alert
    echo "Alert: ASCEP health check failed" | mail -s "ASCEP Alert" admin@example.com
fi
EOF

chmod +x health_check.sh

# Add to crontab for periodic checks
# */5 * * * * /path/to/health_check.sh
```

#### Service Monitoring
```bash
# Monitor service status
watch -n 5 'docker-compose ps && echo "---" && curl -s http://localhost:5000/api/health | jq .'

# Monitor resource usage
watch -n 5 'docker stats --no-stream'
```

### 2. Performance Monitoring

#### Latency Monitoring
```bash
# Monitor API latency
while true; do
    START=$(date +%s.%N)
    curl -s http://localhost:5000/api/health > /dev/null
    END=$(date +%s.%N)
    LATENCY=$(echo "$END - $START" | bc)
    echo "$(date): Latency: ${LATENCY}s"
    sleep 5
done
```

#### Resource Monitoring
```bash
# Monitor memory usage
watch -n 5 'docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"'

# Monitor disk usage
watch -n 30 'df -h && echo "---" && docker system df'
```

## 🚨 Emergency Contacts

### When to Escalate
- All services down for more than 5 minutes
- Data loss or corruption
- Security incidents
- Performance degradation affecting users

### Emergency Procedures
1. **Immediate**: Stop all services to prevent data corruption
2. **Assessment**: Identify root cause
3. **Recovery**: Restore from backup if necessary
4. **Communication**: Notify stakeholders
5. **Documentation**: Record incident details

## 📚 Additional Resources

### Documentation
- [API Documentation](./API-DOCUMENTATION.md)
- [Microservices Architecture](./MICROSERVICES-README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Development Guide](./DEVELOPMENT.md)

### External Resources
- [Docker Documentation](https://docs.docker.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/)

### Community Support
- GitHub Issues: Report bugs and request features
- Stack Overflow: Search for similar issues
- Discord/Slack: Community discussions
- Email Support: For critical issues

## 🔄 Maintenance Schedule

### Daily
- Check service health
- Monitor resource usage
- Review error logs

### Weekly
- Update dependencies
- Review performance metrics
- Backup configuration

### Monthly
- Security updates
- Performance optimization
- Documentation updates

### Quarterly
- Major version updates
- Architecture review
- Disaster recovery testing 