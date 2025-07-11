# ASCEP Price Feed Service

The Price Feed Service manages real-time price data feeds from multiple sources.

## Purpose
- Connect to Binance WebSocket for crypto prices
- Provide mock price feeds for testing
- Store price data in Redis
- Broadcast real-time price updates

## Port
- **Port**: 5002 (via API Gateway)

## Features
- **Real-time Crypto**: 10+ crypto pairs via Binance WebSocket
- **Mock Forex**: 10+ forex pairs for testing
- **Automatic Reconnection**: Handles connection failures
- **Redis Integration**: Stores and broadcasts price data
- **Error Handling**: Robust error management

## Supported Symbols

### Crypto (Real-time via Binance)
- BTC/USDT, ETH/USDT, BNB/USDT
- ADA/USDT, SOL/USDT, DOT/USDT
- LINK/USDT, MATIC/USDT, AVAX/USDT, UNI/USDT

### Forex (Mock Data)
- EUR/USD, GBP/USD, USD/JPY, USD/CHF
- AUD/USD, USD/CAD, NZD/USD, EUR/GBP
- EUR/JPY, GBP/JPY

## Data Flow
1. Connect to price sources
2. Receive price updates
3. Store in Redis
4. Publish to Redis channels
5. Send to API Gateway

## Dependencies
- websocket-client
- requests
- redis
- python-dotenv

## Running
```bash
cd backend/services/price_feeds
pip install -r requirements.txt
python main.py
```

## Environment Variables
- `REDIS_URL` - Redis connection URL
- `BINANCE_API_KEY` - Binance API key (optional)
- `BINANCE_SECRET_KEY` - Binance secret key (optional) 