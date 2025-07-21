# ASCEP Redis Schema Documentation

This document describes the complete Redis data structure used by the ASCEP (Arbitrage Signal Complex Event Processing) platform.

## 📊 Overview

ASCEP uses Redis for:
- **Real-time data storage** (prices, signals, rules)
- **Pub/Sub messaging** between microservices
- **Caching** and performance optimization
- **Service monitoring** and health checks

## 🗂️ Data Structures

### 1. Price Data (`price:*`)

**Key Pattern:** `price:{symbol}`  
**Type:** Hash  
**TTL:** 1 hour (3600 seconds)

```json
{
  "price": "45000.50",
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "binance",
  "volume": "1234567.89",
  "change_24h": "2.5"
}
```

**Examples:**
- `price:BTC/USDT`
- `price:ETH/USDT`
- `price:EUR/USD`

**Operations:**
- **Set:** `HSET price:BTC/USDT price 45000.50 timestamp "2024-01-01T00:00:00Z" source "binance"`
- **Get:** `HGETALL price:BTC/USDT`
- **Get All:** `KEYS price:*`

---

### 2. Arbitrage Signals (`signal:*`)

**Key Pattern:** `signal:{signal_id}`  
**Type:** Hash  
**TTL:** 24 hours (86400 seconds)

```json
{
  "id": "123",
  "symbols": "[\"BTC/USDT\", \"ETH/USDT\"]",
  "prices": "[45000.50, 3200.75]",
  "spread": "0.85",
  "spread_percentage": "0.85",
  "type": "crypto_arbitrage",
  "timestamp": "2024-01-01T00:00:00Z",
  "severity": "high",
  "rule_id": "5",
  "rule_name": "Price Spike Detection"
}
```

**Operations:**
- **Set:** `HMSET signal:123 id 123 symbols "[\"BTC/USDT\"]" spread 0.85`
- **Get:** `HGETALL signal:123`
- **Delete:** `DEL signal:123`
- **Get All:** `KEYS signal:*`

---

### 3. CEP Rules (`cep_rules`)

**Key:** `cep_rules`  
**Type:** Hash  
**TTL:** Persistent (no expiry)

**Hash Fields:** `{rule_id} -> {rule_json}`

```json
{
  "1": {
    "rule_id": 1,
    "name": "Price Spike Detection",
    "pattern": "price_spike",
    "action": "create_signal",
    "conditions": {
      "price_change_threshold": 3.0
    },
    "created_at": "2024-01-01T00:00:00Z",
    "last_triggered": "2024-01-01T12:00:00Z",
    "trigger_count": 15,
    "enabled": true
  },
  "2": {
    "rule_id": 2,
    "name": "Volume Surge Alert",
    "pattern": "volume_surge",
    "action": "send_alert",
    "conditions": {
      "volume_threshold": 2000000
    },
    "created_at": "2024-01-01T01:00:00Z",
    "last_triggered": null,
    "trigger_count": 0,
    "enabled": false
  }
}
```

**Operations:**
- **Set Rule:** `HSET cep_rules 1 '{"rule_id": 1, "name": "Price Spike", ...}'`
- **Get Rule:** `HGET cep_rules 1`
- **Get All Rules:** `HGETALL cep_rules`
- **Delete Rule:** `HDEL cep_rules 1`

---

### 4. Health Status (`health_status`)

**Key:** `health_status`  
**Type:** String (JSON)  
**TTL:** 5 minutes (300 seconds)

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "api_gateway": {
      "status": "healthy",
      "response_time": 15.2
    },
    "health": {
      "status": "healthy",
      "response_time": 8.1
    },
    "price_feeds": {
      "status": "healthy",
      "response_time": 12.5
    },
    "arbitrage": {
      "status": "healthy",
      "response_time": 9.8
    },
    "cep_engine": {
      "status": "healthy",
      "response_time": 11.3
    }
  }
}
```

**Operations:**
- **Set:** `SET health_status '{"status": "healthy", ...}' EX 300`
- **Get:** `GET health_status`

---

### 5. Latency Monitoring (`latency:{service}:{endpoint}`)

**Key Pattern:** `latency:{service}:{endpoint}`  
**Type:** Hash  
**TTL:** 1 hour (3600 seconds)

```json
{
  "last_latency": "15.2",
  "request_count": "1250",
  "error_count": "3",
  "last_update": "2024-01-01T00:00:00Z"
}
```

**Examples:**
- `latency:api_gateway:/api/health`
- `latency:price_feeds:/prices`
- `latency:arbitrage:/signals`

**Operations:**
- **Set Field:** `HSET latency:api_gateway:/api/health last_latency 15.2`
- **Get:** `HGETALL latency:api_gateway:/api/health`
- **Get All:** `KEYS latency:*`

---

### 6. Gateway Latency Stats (`gateway_latency_stats`)

**Key:** `gateway_latency_stats`  
**Type:** String (JSON)  
**TTL:** 5 minutes (300 seconds)

```json
{
  "api_gateway": {
    "/api/health": {
      "avg_latency": 12.5,
      "min_latency": 8.1,
      "max_latency": 25.3,
      "p95_latency": 18.7,
      "p99_latency": 22.1,
      "request_count": 1250,
      "error_rate": 0.002
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Operations:**
- **Set:** `SET gateway_latency_stats '{"api_gateway": {...}}' EX 300`
- **Get:** `GET gateway_latency_stats`

---

## 📡 Pub/Sub Channels

### 1. Price Updates (`price_updates`)

**Purpose:** Real-time price data distribution  
**Publishers:** Price Feed Service  
**Subscribers:** API Gateway, Arbitrage Service, CEP Engine

**Message Format:**
```json
{
  "symbol": "BTC/USDT",
  "price": 45000.50,
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "binance",
  "volume": 1234567.89,
  "change_24h": 2.5
}
```

---

### 2. Arbitrage Signals (`arbitrage_signals`)

**Purpose:** New arbitrage opportunity notifications  
**Publishers:** Arbitrage Service, CEP Engine  
**Subscribers:** API Gateway

**Message Format:**
```json
{
  "id": 123,
  "symbols": ["BTC/USDT", "ETH/USDT"],
  "prices": [45000.50, 3200.75],
  "spread": 0.85,
  "spread_percentage": 0.85,
  "type": "crypto_arbitrage",
  "timestamp": "2024-01-01T00:00:00Z",
  "severity": "high",
  "rule_id": 5,
  "rule_name": "Price Spike Detection"
}
```

---

### 3. CEP Signals (`cep_signals`)

**Purpose:** Complex Event Processing rule triggers  
**Publishers:** CEP Engine  
**Subscribers:** API Gateway

**Message Format:**
```json
{
  "rule_id": 5,
  "rule_name": "Price Spike Detection",
  "pattern": "price_spike",
  "event_data": {
    "symbol": "BTC/USDT",
    "price": 45000.50,
    "price_change": 3.2
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "severity": "high"
}
```

---

### 4. Alerts (`alerts`)

**Purpose:** System alerts and notifications  
**Publishers:** CEP Engine  
**Subscribers:** (Future notification service)

**Message Format:**
```json
{
  "type": "cep_alert",
  "rule_id": 5,
  "rule_name": "Price Spike Detection",
  "message": "CEP Rule 'Price Spike Detection' triggered",
  "event_data": {...},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

### 5. Logs (`logs`)

**Purpose:** System logging  
**Publishers:** CEP Engine  
**Subscribers:** (Future logging service)

**Message Format:**
```json
{
  "level": "info",
  "service": "cep_engine",
  "message": "Rule evaluation completed",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

### 6. Events (`events`)

**Purpose:** General system events  
**Publishers:** Price Feed Service  
**Subscribers:** CEP Engine

**Message Format:**
```json
{
  "type": "price_update",
  "symbol": "BTC/USDT",
  "price": 45000.50,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

### 7. Price Subscriptions (`price_subscriptions`)

**Purpose:** Price feed subscription requests  
**Publishers:** API Gateway  
**Subscribers:** Price Feed Service

**Message Format:**
```json
{
  "symbols": ["BTC/USDT", "ETH/USDT"],
  "action": "subscribe"
}
```

---

### 8. Signal Subscriptions (`signal_subscriptions`)

**Purpose:** Signal subscription requests  
**Publishers:** API Gateway  
**Subscribers:** Arbitrage Service

**Message Format:**
```json
{
  "action": "subscribe"
}
```

---

## 🔍 Redis Commands Reference

### Data Inspection

```bash
# View all price data
redis-cli KEYS "price:*"
redis-cli HGETALL "price:BTC/USDT"

# View all signals
redis-cli KEYS "signal:*"
redis-cli HGETALL "signal:123"

# View all CEP rules
redis-cli HGETALL "cep_rules"
redis-cli HGET "cep_rules" "1"

# View health status
redis-cli GET "health_status"

# View latency stats
redis-cli KEYS "latency:*"
redis-cli HGETALL "latency:api_gateway:/api/health"

# View gateway stats
redis-cli GET "gateway_latency_stats"
```

### Data Management

```bash
# Clear all price data
redis-cli KEYS "price:*" | xargs redis-cli DEL

# Clear all signals
redis-cli KEYS "signal:*" | xargs redis-cli DEL

# Clear all latency data
redis-cli KEYS "latency:*" | xargs redis-cli DEL

# Clear CEP rules
redis-cli DEL "cep_rules"

# Clear health status
redis-cli DEL "health_status"
```

### Monitoring

```bash
# Monitor all Redis operations
redis-cli MONITOR

# Monitor specific channels
redis-cli SUBSCRIBE "price_updates"
redis-cli SUBSCRIBE "arbitrage_signals"
redis-cli SUBSCRIBE "cep_signals"

# Check memory usage
redis-cli INFO memory

# Check connected clients
redis-cli CLIENT LIST
```

---

## 📈 Data Flow

```
Price Feed Service
    ↓ (price_updates)
API Gateway ← CEP Engine ← Arbitrage Service
    ↓ (WebSocket)
Frontend
```

1. **Price Feed Service** publishes price updates to `price_updates` channel
2. **API Gateway** subscribes and forwards to WebSocket clients
3. **Arbitrage Service** subscribes and detects opportunities
4. **CEP Engine** subscribes and evaluates rules
5. **Arbitrage/CEP Services** publish signals to `arbitrage_signals`/`cep_signals`
6. **API Gateway** forwards signals to WebSocket clients

---

## 🛠️ Configuration

### Redis Connection
```bash
# Environment Variables
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### TTL Settings
- **Price Data:** 1 hour (3600s)
- **Signals:** 24 hours (86400s)
- **Health Status:** 5 minutes (300s)
- **Latency Data:** 1 hour (3600s)
- **CEP Rules:** Persistent (no expiry)

---

## 🔧 Troubleshooting

### Common Issues

1. **Missing Data:** Check TTL expiry
2. **Connection Issues:** Verify Redis connection settings
3. **Memory Issues:** Monitor Redis memory usage
4. **Performance Issues:** Check latency statistics

### Debug Commands

```bash
# Check if Redis is running
redis-cli PING

# Check memory usage
redis-cli INFO memory

# Monitor real-time operations
redis-cli MONITOR

# Check specific key
redis-cli TYPE "price:BTC/USDT"
redis-cli TTL "price:BTC/USDT"
```

This schema provides a complete overview of how ASCEP uses Redis for data storage, caching, and real-time communication between microservices. 