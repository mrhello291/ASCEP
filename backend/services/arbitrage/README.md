# ASCEP Arbitrage Service

The Arbitrage Service detects and manages arbitrage opportunities in real-time.

## Purpose
- Detect cross-currency arbitrage opportunities
- Detect triangular arbitrage opportunities
- Generate and manage arbitrage signals
- Provide arbitrage statistics

## Port
- **Port**: 5003

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service information |
| `/health` | GET | Health check |
| `/signals` | GET | Get arbitrage signals |
| `/signals` | POST | Create arbitrage signal |
| `/signals/<id>` | GET | Get specific signal |
| `/signals/<id>` | DELETE | Delete signal |
| `/stats` | GET | Arbitrage statistics |

## Features
- Real-time arbitrage detection (10-second intervals)
- Configurable spread thresholds
- Cross-currency arbitrage detection
- Triangular arbitrage detection
- Signal history management
- Redis-based signal storage

## Arbitrage Types
- **Cross-currency**: EUR/USD vs USD/EUR
- **Triangular**: EUR/USD → USD/JPY → EUR/JPY

## Dependencies
- Flask
- Flask-CORS
- Redis

## Running
```bash
cd backend/services/arbitrage
pip install -r requirements.txt
python main.py
```

## Environment Variables
- `REDIS_URL` - Redis connection URL
- `SECRET_KEY` - Flask secret key 