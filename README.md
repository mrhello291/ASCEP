# ASCEP - Arbitrage Signal Complex Event Processing Platform

A real-time, distributed event-driven system for detecting arbitrage opportunities in financial markets using complex event processing.

## 🚀 Features

- **Multi-source Data Ingestion**: Connect to multiple price feeds (Binance WebSocket, Alpha Vantage, etc.)
- **Real-time CEP Engine**: Apache Flink-based streaming rules engine
- **Event Bus & Persistence**: Redis-based event streaming with persistence
- **Real-time Web Dashboard**: React frontend with WebSocket updates
- **Serverless Orchestration**: AWS Lambda functions for automation
- **Monitoring & Resilience**: CloudWatch integration with circuit breakers

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Price Feeds   │    │   CEP Engine    │    │   Web Dashboard │
│  (WebSocket)    │───▶│   (Flink)       │───▶│   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Event Bus     │    │   Persistence   │    │   Monitoring    │
│   (Redis)       │    │   (S3/Parquet)  │    │ (CloudWatch)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

- **Backend**: Flask, Django Channels (WebSockets)
- **Frontend**: React, Recharts, Monaco Editor
- **Streaming**: Apache Flink, Redis
- **Task Queue**: Celery
- **Cloud**: AWS Lambda, CloudWatch
- **Infrastructure**: Terraform, Docker

## 📁 Project Structure

```
ASCEP/
├── backend/                 # Flask/Django backend
├── frontend/               # React frontend
├── cep_engine/            # Apache Flink CEP engine
├── data_ingestion/        # Price feed connectors
├── infrastructure/        # Terraform configs
├── monitoring/           # CloudWatch dashboards
├── scripts/              # Deployment scripts
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites
- **Python**: 3.12+ (recommended) or 3.13 (experimental)
- **Node.js**: 18+ 
- **Redis**: Latest version
- **pnpm**: Latest version

> **💡 Recommendation**: Use Python 3.12 for better package compatibility. Python 3.13 is still in development and many packages may have compatibility issues.

### Environment Check
Before installing, check your environment:
```bash
python3 check_python.py
```

### Installation Options

**Option 1: Automated Setup (Recommended)**
```bash
./setup.sh
```

**Option 2: Manual Installation**
```bash
# 1. Clone and setup
git clone <your-repo>
cd ASCEP

# 2. Backend (uses latest package versions)
cd backend
pip install -r requirements.txt

# 3. Frontend (uses latest package versions)
cd ../frontend
pnpm install
```

**Option 3: Minimal Installation (if you encounter issues)**
```bash
cd backend
pip install -r requirements-minimal.txt
```

3. **Start services**:
   ```bash
   # Start Redis
   redis-server
   
   # Start backend
   cd backend
   python app.py
   
   # Start frontend
   cd frontend
   npm start
   ```

## 📊 System Design Highlights

- **Event-Driven Architecture**: Real-time processing with minimal latency
- **Fault Tolerance**: Circuit breakers and fallback mechanisms
- **Scalability**: Horizontal scaling with Redis and Celery
- **Monitoring**: Comprehensive observability with CloudWatch
- **Security**: IAM policies, KMS encryption, secure API endpoints

## 🎯 CEP Rules Example

```python
# Example arbitrage detection rule
IF price("EUR/USD") - price("USD/EUR") > 0.001 
THEN ARBITRAGE_SIGNAL
```

## 📈 Performance Targets

- **Latency**: < 200ms end-to-end
- **Uptime**: 99.9%
- **Throughput**: 10,000+ events/second

## 🔧 Development

- **API Documentation**: `/docs` endpoint
- **Testing**: pytest for backend, Jest for frontend
- **CI/CD**: GitHub Actions pipeline
- **Code Quality**: Black, flake8, ESLint

## 📝 License

MIT License - see LICENSE file for details