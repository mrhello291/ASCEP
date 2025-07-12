# ASCEP Microservices Architecture

ASCEP (Arbitrage Signal Complex Event Processing) is built as a distributed microservices architecture with an API Gateway pattern, designed for real-time financial data processing and arbitrage detection.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (React/Vercel)│◄──►│   (Port 5000)   │◄──►│                 │
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
- **Purpose**: Single entry point for all client requests with WebSocket support
- **Technology**: Flask 2.3.3 + Flask-SocketIO + Eventlet
- **Responsibilities**:
  - Route HTTP requests to appropriate microservices
  - Handle WebSocket connections for real-time updates
  - Aggregate health checks from all services
  - Monitor service latency and performance
  - Provide unified API interface
- **Key Features**:
  - Real-time WebSocket connections
  - Service discovery and routing
  - Latency monitoring and metrics
  - CORS configuration
  - Redis pub/sub integration
- **Endpoints**:
  - `GET /` - Gateway information
  - `GET /api/health` - Health check for all services
  - `GET /api/prices` - Price data routing
  - `GET /api/signals` - Arbitrage signals routing
  - `GET /api/rules` - CEP rules routing
  - `GET /api/latency` - Service latency statistics
  - `GET /api/services` - List all services

### 2. Health Service (Port 5001)
- **Purpose**: Monitor health and status of all microservices
- **Technology**: Flask 2.3.3
- **Responsibilities**:
  - Continuous health monitoring of all services
  - Service discovery and status reporting
  - Metrics collection and reporting
  - System resource monitoring
  - Alerting capabilities (future)
- **Key Features**:
  - Real-time service health checks
  - Response time monitoring
  - Error rate tracking
  - Resource utilization metrics
- **Endpoints**:
  - `GET /health` - Basic health check
  - `GET /status` - Detailed status information
  - `GET /metrics` - Service metrics and statistics

### 3. Price Feed Service (Port 5002)
- **Purpose**: Manage real-time price data feeds from multiple sources
- **Technology**: Flask 3.0.0 + WebSocket Client
- **Responsibilities**:
  - Binance WebSocket connections for crypto prices
  - Mock price feeds for forex pairs
  - Price data storage and caching in Redis
  - Real-time price updates via Redis pub/sub
  - Automatic reconnection and error handling
- **Key Features**:
  - 10+ crypto pairs (real-time from Binance)
  - 10+ forex pairs (mock data for testing)
  - Automatic WebSocket reconnection
  - Comprehensive error handling
  - Redis-based data persistence
- **Supported Pairs**:
  - Crypto: BTC/USDT, ETH/USDT, BNB/USDT, ADA/USDT, etc.
  - Forex: EUR/USD, GBP/USD, USD/JPY, EUR/GBP, etc.

### 4. Arbitrage Service (Port 5003)
- **Purpose**: Detect and manage arbitrage opportunities across markets
- **Technology**: Flask 2.3.3
- **Responsibilities**:
  - Cross-currency arbitrage detection
  - Triangular arbitrage detection
  - Signal generation and storage
  - Real-time signal broadcasting via Redis
  - Arbitrage statistics and analytics
- **Key Features**:
  - Configurable spread thresholds
  - Multiple arbitrage detection algorithms
  - Signal history management
  - Real-time signal broadcasting
  - Performance statistics
- **Detection Types**:
  - Direct arbitrage (A/B vs B/A)
  - Triangular arbitrage (A/B → B/C → C/A)
  - Statistical arbitrage (future)

### 5. CEP Engine Service (Port 5004)
- **Purpose**: Complex Event Processing and pattern detection
- **Technology**: Flask 2.3.3
- **Responsibilities**:
  - Rule-based event processing
  - Pattern detection and correlation
  - Event filtering and transformation
  - Automated action execution
  - Rule management and testing
- **Supported Patterns**:
  - Price spikes and volatility
  - Volume surges and anomalies
  - Arbitrage opportunity patterns
  - Trend reversals and breakouts
  - Custom user-defined patterns
- **Rule Engine Features**:
  - JSON-based rule definitions
  - Real-time rule evaluation
  - Rule testing and validation
  - Performance monitoring

## 🔧 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (for containerized deployment)
- Redis (optional for local development)

### Local Development with Docker (Recommended)

1. **Clone and setup**:
```bash
git clone <repository>
cd ASCEP
```

2. **Start all services with Docker**:
```bash
./start_docker.sh
```

3. **Access the application**:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:5000
- Health Check: http://localhost:5000/api/health

### Manual Development Setup

1. **Backend Setup**:
```bash
cd backend
pip install -r requirements.txt
cd services/api_gateway && pip install -r requirements.txt
cd ../health && pip install -r requirements.txt
cd ../price_feeds && pip install -r requirements.txt
cd ../arbitrage && pip install -r requirements.txt
cd ../cep_engine && pip install -r requirements.txt
```

2. **Frontend Setup**:
```bash
cd frontend
pnpm install
```

3. **Start Redis** (if not using Docker):
```bash
redis-server
```

4. **Start Services**:
```bash
# API Gateway
cd backend/services/api_gateway && python main.py

# Health Service
cd backend/services/health && python main.py

# Price Feed Service
cd backend/services/price_feeds && python main.py

# Arbitrage Service
cd backend/services/arbitrage && python main.py

# CEP Engine Service
cd backend/services/cep_engine && python main.py

# Frontend
cd frontend && pnpm start
```

## 🌐 API Endpoints

### API Gateway Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Gateway information |
| `/api/health` | GET | Health check for all services |
| `/api/prices` | GET | Get current price data |
| `/api/signals` | GET | Get arbitrage signals |
| `/api/rules` | GET | Get CEP rules |
| `/api/latency` | GET | Service latency statistics |
| `/api/services` | GET | List all services |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `price_update` | Server → Client | Real-time price updates |
| `arbitrage_signal` | Server → Client | New arbitrage signals |
| `subscribe_prices` | Client → Server | Subscribe to price updates |
| `subscribe_signals` | Client → Server | Subscribe to signal updates |

### Service-Specific Endpoints

#### Health Service (Port 5001)
- `GET /health` - Basic health check
- `GET /status` - Detailed status information
- `GET /metrics` - Service metrics and statistics

#### Price Feed Service (Port 5002)
- `GET /prices` - Get current prices for all pairs
- `GET /prices/<symbol>` - Get price for specific symbol
- `GET /health` - Service health check
- `GET /status` - Service status and connection info

#### Arbitrage Service (Port 5003)
- `GET /signals` - Get recent arbitrage signals
- `GET /signals/<id>` - Get specific signal details
- `GET /stats` - Arbitrage statistics and performance
- `GET /health` - Service health check
- `GET /config` - Current arbitrage configuration

#### CEP Engine Service (Port 5004)
- `GET /rules` - Get all CEP rules
- `POST /rules` - Create new rule
- `GET /rules/<id>` - Get specific rule
- `PUT /rules/<id>` - Update rule
- `DELETE /rules/<id>` - Delete rule
- `POST /rules/<id>/test` - Test rule with sample data
- `GET /stats` - CEP statistics and performance
- `GET /health` - Service health check

## 🔄 Event Flow

### 1. Price Updates Flow
```
Binance WebSocket → Price Feed Service → Redis Pub/Sub → API Gateway → Frontend (WebSocket)
```

### 2. Arbitrage Detection Flow
```
Price Data → Arbitrage Service → Signal Generation → Redis Pub/Sub → API Gateway → Frontend
```

### 3. CEP Processing Flow
```
Events → CEP Engine → Rule Evaluation → Actions → Redis Pub/Sub → API Gateway → Frontend
```

### 4. Health Monitoring Flow
```
All Services → Health Service → API Gateway → Frontend Dashboard
```

## 🚀 Deployment

### Railway Deployment (Production)

1. **Docker-based deployment**:
```bash
# Railway automatically detects Dockerfile.railway
railway up
```

2. **Environment variables**:
```bash
# Required
SECRET_KEY=your-secure-secret-key-here
NODE_ENV=production

# Optional (Redis is built into container)
REDIS_URL=your-redis-url (if using external Redis)
```

3. **Service management**:
- All services managed by Supervisor
- Built-in Redis server
- Automatic health checks
- Process monitoring and restart

### Local Docker Deployment

1. **Start with Docker Compose**:
```bash
./start_docker.sh
```

2. **Or manual Docker Compose**:
```bash
docker-compose up --build -d
```

3. **Monitor services**:
```bash
docker-compose logs -f
docker-compose ps
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REDIS_URL` | Redis connection URL | No | `redis://localhost:6379` |
| `REDIS_HOST` | Redis host | No | `localhost` |
| `REDIS_PORT` | Redis port | No | `6379` |
| `REDIS_PASSWORD` | Redis password | No | `None` |
| `SECRET_KEY` | Flask secret key | Yes | `your-secret-key-here` |
| `NODE_ENV` | Environment | No | `development` |
| `RAILWAY_ENVIRONMENT` | Railway environment | No | `false` |
| `DOCKER_COMPOSE` | Docker Compose mode | No | `false` |

### Service Configuration

Each service can be configured independently:

- **API Gateway**: CORS settings, WebSocket configuration
- **Price Feeds**: WebSocket URLs, reconnection settings
- **Arbitrage**: Spread thresholds, detection algorithms
- **CEP Engine**: Rule definitions, pattern matching
- **Health Service**: Monitoring intervals, alert thresholds

## 📊 Monitoring

### Health Checks
- Each service provides `/health` endpoint
- API Gateway aggregates health from all services
- Health service continuously monitors all services
- Automatic service discovery and status reporting

### Metrics
- Service response times and latency
- Error rates and failure tracking
- Throughput and performance metrics
- Resource utilization monitoring
- Real-time dashboard updates

### Logging
- Structured logging across all services
- Error tracking and debugging
- Performance monitoring
- Audit trail for arbitrage signals

## 🔒 Security

### API Security
- CORS configuration for cross-origin requests
- Environment-based secret management
- Input validation and sanitization
- Rate limiting (future implementation)

### Data Security
- Redis connection security
- Environment variable protection
- Secure WebSocket connections
- Data encryption (future implementation)

## 🚀 Performance

### Optimization Features
- Redis pub/sub for real-time communication
- WebSocket connections for low-latency updates
- Service isolation and independent scaling
- Connection pooling and resource management
- Caching strategies for frequently accessed data

### Performance Targets
- **Latency**: < 200ms end-to-end
- **Throughput**: 10,000+ events/second
- **Uptime**: 99.9%
- **Real-time Updates**: < 100ms WebSocket latency

## 🔄 Development Workflow

### Local Development
1. Use Docker Compose for full stack development
2. Individual service development with manual startup
3. Hot reloading for frontend development
4. Integrated debugging and logging

### Testing
- Unit tests for each service
- Integration tests for API endpoints
- End-to-end tests for complete workflows
- Performance testing for real-time features

### Deployment Pipeline
1. Code changes pushed to Git
2. Automated testing and validation
3. Railway deployment for backend
4. Vercel deployment for frontend
5. Health checks and monitoring 