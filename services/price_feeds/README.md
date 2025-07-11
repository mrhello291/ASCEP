# ASCEP Price Feed Service

Standalone service for running price feeds on Railway.

## 🚀 Quick Deploy

### Railway Deployment

1. **Create new Railway service**
2. **Connect to GitHub repo**
3. **Set Root Directory**: `services/price_feeds`
4. **Set Start Command**: `python price_feed_service.py`
5. **Add Environment Variable**:
   ```
   RAILWAY_STATIC_URL=https://your-main-backend-url.railway.app
   ```

## 📊 Features

- **Binance WebSocket**: Real-time crypto price feeds
- **Mock Forex**: Simulated forex data for testing
- **Automatic Reconnection**: Handles connection drops
- **Status Monitoring**: Logs feed status every 30 seconds

## 🔧 Configuration

### Environment Variables

- `RAILWAY_STATIC_URL`: URL of your main ASCEP backend
- `DEBUG`: Enable debug logging (optional)

### Supported Symbols

**Crypto (Real-time via Binance):**
- BTC/USDT, ETH/USDT, BNB/USDT
- ADA/USDT, SOL/USDT, DOT/USDT
- LINK/USDT, MATIC/USDT, AVAX/USDT, UNI/USDT

**Forex (Mock data):**
- EUR/USD, GBP/USD, USD/JPY, USD/CHF
- AUD/USD, USD/CAD, NZD/USD, EUR/GBP
- EUR/JPY, GBP/JPY

## 📈 Monitoring

The service logs:
- Connection status every 30 seconds
- Price updates sent to backend
- Error messages and reconnection attempts

## 🔗 Integration

This service sends price updates to your main ASCEP backend via HTTP POST requests to `/api/prices`. 