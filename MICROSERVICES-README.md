# ASCEP Microservices Architecture

ASCEP (Arbitrage Signal Complex Event Processing) is now built as a proper microservices architecture with an API Gateway pattern.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (React)       │◄──►│   (Port 5000)   │◄──►│                 │
└─────────────────┘    └─────────────────┘    │  ┌─────────────┐ │
                                              │  │ Health      │ │
                                              │  │ (Port 5001) │ │
                                              │  └─────────────┘ │
                                              │  ┌─────────────┐ │
                                              │  │ Price Feed  │ │
                                              │  │ (Port 5002) │ │
                                              │  └─────────────┘ │
                                              │  ┌─────────────┐ │
                                              │  │ Arbitrage   │ │
                                              │  │ (Port 5003) │ │
                                              │  └─────────────┘ │
                                              │  ┌─────────────┐ │
                                              │  │ CEP Engine  │ │
                                              │  │ (Port 5004) │ │
                                              │  └─────────────┘ │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │     Redis       │
                                              │   Event Bus     │
                                              └─────────────────┘
```

## 🚀 Services

### 1. API Gateway (Port 5000)
- **Purpose**: Single entry point for all client requests
- **Responsibilities**:
  - Route requests to appropriate microservices
  - Handle WebSocket connections
  - Aggregate health checks
  - Load balancing (future)
- **Endpoints**:
  - `/api/health` - Health check for all services
  - `/api/prices` - Price data routing
  - `/api/signals` - Arbitrage signals routing
  - `/api/rules` - CEP rules routing

### 2. Health Service (Port 5001)
- **Purpose**: Monitor health of all microservices
- **Responsibilities**:
  - Continuous health monitoring
  - Service discovery
  - Metrics collection
  - Alerting (future)
- **Endpoints**:
  - `/health` - Basic health check
  - `/status` - Detailed status
  - `/metrics` - Service metrics

### 3. Price Feed Service (Port 5002)
- **Purpose**: Manage real-time price data feeds
- **Responsibilities**:
  - Binance WebSocket connections
  - Mock price feeds for testing
  - Price data storage in Redis
  - Real-time price updates
- **Features**:
  - 10+ crypto pairs (real-time)
  - 10+ forex pairs (mock data)
  - Automatic reconnection
  - Error handling

### 4. Arbitrage Service (Port 5003)
- **Purpose**: Detect and manage arbitrage opportunities
- **Responsibilities**:
  - Cross-currency arbitrage detection
  - Triangular arbitrage detection
  - Signal generation and storage
  - Real-time signal broadcasting
- **Features**:
  - Configurable spread thresholds
  - Multiple arbitrage types
  - Signal history management
  - Statistics and analytics

### 5. CEP Engine Service (Port 5004)
- **Purpose**: Complex Event Processing and pattern detection
- **Responsibilities**:
  - Rule-based event processing
  - Pattern detection
  - Event correlation
  - Automated actions
- **Supported Patterns**:
  - Price spikes
  - Volume surges
  - Arbitrage opportunities
  - Trend reversals
  - Custom patterns

## 🔧 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Redis (optional, for production features)

### Local Development

1. **Clone and setup**:
```bash
git clone <repository>
cd ASCEP
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
```

2. **Start all services**:
```bash
./start_microservices.sh
```

3. **Access the application**:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:5000
- Health Check: http://localhost:5000/api/health

### Individual Service Development

You can also run services individually for development:

```bash
# API Gateway
cd backend && python api_gateway.py

# Health Service
cd backend/services && python health_service.py

# Price Feed Service
cd backend/services/price_feeds && python price_feed_service.py

# Arbitrage Service
cd backend/services && python arbitrage_service.py

# CEP Engine Service
cd backend/services && python cep_engine_service.py
```

## 🌐 API Endpoints

### API Gateway Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Gateway information |
| `/api/health` | GET | Health check for all services |
| `/api/prices` | GET/POST | Price data operations |
| `/api/signals` | GET/POST | Arbitrage signals operations |
| `/api/rules` | GET/POST | CEP rules operations |

### Service-Specific Endpoints

#### Health Service (Port 5001)
- `GET /health` - Basic health check
- `GET /status` - Detailed status
- `GET /metrics` - Service metrics

#### Price Feed Service (Port 5002)
- `GET /prices` - Get current prices
- `POST /prices` - Update price data
- `GET /health` - Service health

#### Arbitrage Service (Port 5003)
- `GET /signals` - Get arbitrage signals
- `POST /signals` - Create signal
- `GET /signals/<id>` - Get specific signal
- `DELETE /signals/<id>` - Delete signal
- `GET /stats` - Arbitrage statistics
- `GET /health` - Service health

#### CEP Engine Service (Port 5004)
- `GET /rules` - Get all CEP rules
- `POST /rules` - Create new rule
- `GET /rules/<id>` - Get specific rule
- `PUT /rules/<id>` - Update rule
- `DELETE /rules/<id>` - Delete rule
- `POST /rules/<id>/test` - Test rule
- `GET /stats` - CEP statistics
- `GET /health` - Service health

## 🔄 Event Flow

1. **Price Updates**:
   ```
   Price Feed → Redis → Arbitrage Service → CEP Engine → API Gateway → Frontend
   ```

2. **Arbitrage Detection**:
   ```
   Price Data → Arbitrage Service → Signal Generation → Redis → API Gateway → Frontend
   ```

3. **CEP Processing**:
   ```
   Events → CEP Engine → Rule Evaluation → Actions → Redis → API Gateway → Frontend
   ```

## 🚀 Deployment

### Railway Deployment

1. **Update Railway configuration**:
```bash
# Use the new microservices configuration
cp railway-microservices.json railway.json
```

2. **Deploy to Railway**:
```bash
railway up
```

3. **Set environment variables**:
   - `REDIS_URL` - Redis connection string
   - `RAILWAY_ENVIRONMENT` - Set to "production"

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REDIS_URL` | Redis connection URL | Yes (for production) |
| `REDIS_HOST` | Redis host | Fallback |
| `REDIS_PORT` | Redis port | Fallback |
| `REDIS_PASSWORD` | Redis password | Fallback |
| `RAILWAY_ENVIRONMENT` | Environment identifier | Yes |
| `SECRET_KEY` | Flask secret key | Yes |

## 📊 Monitoring

### Health Checks
- Each service provides `/health` endpoint
- API Gateway aggregates health from all services
- Health service continuously monitors all services

### Metrics
- Service response times
- Error rates
- Throughput metrics
- Custom business metrics

### Logging
- Structured logging across all services
- Centralized log collection (future)
- Error tracking and alerting

## 🔧 Configuration

### Service Configuration
Each service can be configured independently:

```python
# Example: CEP Engine configuration
CEP_CONFIG = {
    'max_rules': 100,
    'evaluation_interval': 10,
    'pattern_timeout': 300
}
```

### Redis Configuration
```python
# Supports both URL and individual parameters
REDIS_URL = "redis://localhost:6379/0"
# OR
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_PASSWORD = None
```

## 🛠️ Development

### Adding New Services

1. Create service file in `backend/services/`
2. Add service to `SERVICES` configuration in API Gateway
3. Update startup script
4. Add health check endpoint
5. Update documentation

### Service Communication

Services communicate via:
- **HTTP/REST**: Direct service-to-service calls
- **Redis Pub/Sub**: Event-driven communication
- **Redis Storage**: Shared data storage

### Testing

```bash
# Test individual services
curl http://localhost:5001/health
curl http://localhost:5002/prices
curl http://localhost:5003/signals
curl http://localhost:5004/rules

# Test through API Gateway
curl http://localhost:5000/api/health
curl http://localhost:5000/api/prices
curl http://localhost:5000/api/signals
curl http://localhost:5000/api/rules
```

## 🚨 Troubleshooting

### Common Issues

1. **Service won't start**:
   - Check port availability
   - Verify dependencies
   - Check environment variables

2. **Redis connection issues**:
   - Verify Redis is running
   - Check connection parameters
   - Test with `redis-cli ping`

3. **Service communication failures**:
   - Check service health endpoints
   - Verify network connectivity
   - Review service logs

### Debug Mode

Enable debug mode for development:
```bash
export FLASK_DEBUG=1
./start_microservices.sh
```

## 📈 Performance

### Current Capabilities
- **Throughput**: ~100-500 events/sec
- **Latency**: <200ms (target)
- **Concurrent Connections**: 100+

### Scaling Considerations
- Horizontal scaling per service
- Load balancing at API Gateway
- Redis clustering for high availability
- Database optimization for historical data

## 🔮 Future Enhancements

- [ ] Service mesh implementation
- [ ] Advanced load balancing
- [ ] Circuit breaker patterns
- [ ] Distributed tracing
- [ ] Advanced monitoring and alerting
- [ ] Auto-scaling capabilities
- [ ] Blue-green deployments
- [ ] Advanced CEP patterns
- [ ] Machine learning integration 