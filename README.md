# ASCEP - Arbitrage Signal Complex Event Processing Platform

A real-time, distributed microservices platform for detecting arbitrage opportunities in financial markets using complex event processing and WebSocket-based data streaming. BUilt it to experiment with finance data signals

## 🚀 Features

- **Microservices Architecture**: Distributed services with API Gateway pattern
- **Real-time Data Streaming**: WebSocket connections to Binance and mock price feeds
- **Complex Event Processing**: Rule-based pattern detection and signal generation
- **Arbitrage Detection**: Cross-currency and triangular arbitrage opportunities
- **Real-time Dashboard**: React frontend with live WebSocket updates
- **Health Monitoring**: Comprehensive service health checks and metrics
- **Docker Deployment**: Containerized services for easy deployment
- **Cloud Deployment**: Railway (backend) + Vercel (frontend) deployment

## 🏗️ Architecture

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

## 🛠️ Tech Stack

### Backend (Microservices)
- **Framework**: Flask 2.3.3+ with Flask-SocketIO
- **Language**: Python 3.11+
- **Event Streaming**: Redis 7+ (Pub/Sub)
- **WebSockets**: Flask-SocketIO with Eventlet
- **API Gateway**: Custom routing with latency monitoring
- **Process Management**: Supervisor (production)

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Create React App
- **Styling**: Tailwind CSS 3.2.7
- **Charts**: Recharts 2.5.0
- **Code Editor**: Monaco Editor 4.4.6
- **Notifications**: React Hot Toast 2.4.0
- **Icons**: Lucide React 0.263.1
- **Package Manager**: pnpm

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Cloud Backend**: Railway (Docker deployment)
- **Cloud Frontend**: Vercel (Static hosting)
- **Database**: Redis (in-memory + persistence)
- **Process Manager**: Supervisor (production)

### Development Tools
- **Package Management**: pip (Python), pnpm (Node.js)
- **Environment**: Python 3.11+, Node.js 18+
- **Version Control**: Git

## 📁 Project Structure

```
ASCEP/
├── backend/                     # Backend microservices
│   ├── services/
│   │   ├── api_gateway/        # API Gateway (Port 5000)
│   │   ├── health/             # Health Service (Port 5001)
│   │   ├── price_feeds/        # Price Feed Service (Port 5002)
│   │   ├── arbitrage/          # Arbitrage Service (Port 5003)
│   │   ├── cep_engine/         # CEP Engine Service (Port 5004)
│   │   └── celery_worker/      # Background task processing
│   └── requirements.txt        # Shared dependencies
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   └── App.js             # Main application
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind configuration
├── docker-compose.yml         # Local development setup
├── start_docker.sh           # Docker startup script
├── Dockerfile.railway        # Railway deployment
├── railway.json              # Railway configuration
├── vercel.json               # Vercel configuration
└── supervisord.conf          # Production process management
```

## 🚀 Quick Start

### Prerequisites
- **Python**: 3.11+ (recommended)
- **Node.js**: 18+ 
- **Docker**: Latest version
- **pnpm**: Latest version
- **Redis**: Latest version (optional for local development)

### Local Development with Docker (Recommended)

1. **Clone the repository**:
```bash
git clone <your-repo>
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
# Start API Gateway
cd backend/services/api_gateway && python main.py

# Start other services in separate terminals
cd backend/services/health && python main.py
cd backend/services/price_feeds && python main.py
cd backend/services/arbitrage && python main.py
cd backend/services/cep_engine && python main.py

# Start Frontend
cd frontend && pnpm start
```

## 🌐 API Endpoints

### API Gateway (Port 5000)
- `GET /` - Gateway information
- `GET /api/health` - Health check for all services
- `GET /api/prices` - Get current price data
- `GET /api/signals` - Get arbitrage signals
- `GET /api/rules` - Get CEP rules
- `GET /api/latency` - Service latency statistics
- `GET /api/services` - List all services

### WebSocket Events
- `price_update` - Real-time price updates
- `arbitrage_signal` - New arbitrage signals
- `subscribe_prices` - Subscribe to price updates
- `subscribe_signals` - Subscribe to signal updates

## 📊 System Features

- **Real-time Processing**: < 200ms end-to-end latency
- **Fault Tolerance**: Circuit breakers and fallback mechanisms
- **Scalability**: Horizontal scaling with Redis pub/sub
- **Monitoring**: Comprehensive health checks and metrics
- **Security**: CORS configuration and environment-based secrets

## 🎯 CEP Rules Example

```python
# Example arbitrage detection rule
IF price("EUR/USD") - price("USD/EUR") > 0.001 
THEN ARBITRAGE_SIGNAL
```

## 🚀 Deployment

### Railway (Backend)
- Single Docker container deployment
- All microservices managed by Supervisor
- Built-in Redis server
- Automatic health checks

### Vercel (Frontend)
- Static site deployment
- Automatic builds from Git
- Global CDN distribution

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Documentation

- [Microservices Architecture](./MICROSERVICES-README.md) - Detailed service documentation
- [Deployment Guide](./DEPLOYMENT.md) - Railway and Vercel deployment
- [API Documentation](./API-DOCUMENTATION.md) - Complete API reference
- [Development Guide](./DEVELOPMENT.md) - Development setup and guidelines

## 🔧 Development

- **API Documentation**: Available at `/api/health` endpoint
- **Testing**: pytest for backend, Jest for frontend
- **Code Quality**: Black, flake8, ESLint
- **Docker**: Containerized development environment

## 📈 Performance Targets

- **Latency**: < 200ms end-to-end
- **Uptime**: 99.9%
- **Throughput**: 10,000+ events/second
- **Real-time Updates**: WebSocket-based streaming

## 📝 License

MIT License - see LICENSE file for details
