# ASCEP CEP Engine Service

The CEP (Complex Event Processing) Engine Service handles rule-based event processing and pattern detection.

## Purpose
- Process complex event patterns
- Execute rule-based logic
- Detect market anomalies
- Trigger automated actions

## Port
- **Port**: 5004

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service information |
| `/health` | GET | Health check |
| `/rules` | GET | Get all CEP rules |
| `/rules` | POST | Create new rule |
| `/rules/<id>` | GET | Get specific rule |
| `/rules/<id>` | PUT | Update rule |
| `/rules/<id>` | DELETE | Delete rule |
| `/rules/<id>/test` | POST | Test rule |
| `/stats` | GET | CEP statistics |

## Supported Patterns
- **Price Spike**: Detect sudden price changes
- **Volume Surge**: Detect unusual trading volume
- **Arbitrage Opportunity**: Detect arbitrage conditions
- **Trend Reversal**: Detect trend changes
- **Custom**: User-defined patterns

## Actions
- **Create Signal**: Generate arbitrage signal
- **Send Alert**: Send notification
- **Log Event**: Record event for analysis

## Features
- Real-time event processing
- Rule persistence in Redis
- Pattern evaluation engine
- Statistics and metrics
- Rule testing capabilities

## Dependencies
- Flask
- Flask-CORS
- Redis

## Running
```bash
cd backend/services/cep_engine
pip install -r requirements.txt
python main.py
```

## Environment Variables
- `REDIS_URL` - Redis connection URL
- `SECRET_KEY` - Flask secret key 