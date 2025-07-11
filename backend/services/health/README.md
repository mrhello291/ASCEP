# ASCEP Health Service

The Health Service monitors the health and status of all microservices in the ASCEP architecture.

## Purpose
- Monitor health of all microservices
- Provide service discovery
- Collect metrics
- Enable alerting (future)

## Port
- **Port**: 5001

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service information |
| `/health` | GET | Basic health check |
| `/status` | GET | Detailed status |
| `/metrics` | GET | Service metrics |

## Monitored Services
- API Gateway (Port 5000)
- Price Feed Service (Port 5002)
- Arbitrage Service (Port 5003)
- CEP Engine Service (Port 5004)

## Features
- Continuous health monitoring (30-second intervals)
- Response time tracking
- Service status aggregation
- Redis-based status storage

## Dependencies
- Flask
- Flask-CORS
- Redis
- Requests

## Running
```bash
cd backend/services/health
pip install -r requirements.txt
python main.py
```

## Environment Variables
- `REDIS_URL` - Redis connection URL
- `SECRET_KEY` - Flask secret key 