# ASCEP API Documentation

Complete API reference for the ASCEP (Arbitrage Signal Complex Event Processing) platform.

## 🌐 Base URL

- **Local Development**: `http://localhost:5000`
- **Production**: `https://your-railway-url.railway.app`

## 🔌 WebSocket Connection

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('https://your-railway-url.railway.app', {
  transports: ['websocket', 'polling']
});
```

### Events

#### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `subscribe_prices` | `{ symbols: string[] }` | Subscribe to price updates for specific symbols |
| `subscribe_signals` | `{}` | Subscribe to arbitrage signal updates |
| `connect` | `{}` | Client connection established |
| `disconnect` | `{}` | Client disconnection |

#### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `price_update` | `{ symbol, price, timestamp }` | Real-time price update |
| `arbitrage_signal` | `{ type, spread_percentage, pairs, timestamp }` | New arbitrage signal |
| `connected` | `{ message: string }` | Connection confirmation |
| `subscription_confirmed` | `{ type: string }` | Subscription confirmation |

## 📡 REST API Endpoints

### API Gateway Endpoints

#### 1. Gateway Information
```http
GET /
```

**Response:**
```json
{
  "name": "ASCEP API Gateway",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 2. Health Check
```http
GET /api/health
```

**Response:**
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

#### 3. Price Data
```http
GET /api/prices
```

**Response:**
```json
{
  "prices": {
    "BTC/USDT": {
      "price": 45000.50,
      "timestamp": "2024-01-01T00:00:00Z",
      "source": "binance"
    },
    "ETH/USDT": {
      "price": 3200.75,
      "timestamp": "2024-01-01T00:00:00Z",
      "source": "binance"
    },
    "EUR/USD": {
      "price": 1.0850,
      "timestamp": "2024-01-01T00:00:00Z",
      "source": "mock"
    }
  },
  "total_pairs": 25,
  "last_updated": "2024-01-01T00:00:00Z"
}
```

#### 4. Arbitrage Signals
```http
GET /api/signals
```

**Query Parameters:**
- `limit` (optional): Number of signals to return (default: 50)
- `type` (optional): Filter by signal type (`direct`, `triangular`)

**Response:**
```json
{
  "signals": [
    {
      "id": "signal_001",
      "type": "direct",
      "pairs": ["EUR/USD", "USD/EUR"],
      "spread_percentage": 0.15,
      "profit_potential": 0.0015,
      "timestamp": "2024-01-01T00:00:00Z",
      "status": "active"
    }
  ],
  "total_signals": 150,
  "active_signals": 25
}
```

#### 5. CEP Rules
```http
GET /api/rules
```

**Response:**
```json
{
  "rules": [
    {
      "id": "rule_001",
      "name": "Price Spike Detection",
      "description": "Detect sudden price increases",
      "pattern": {
        "condition": "price_change > 5%",
        "timeframe": "5m"
      },
      "action": "generate_alert",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total_rules": 10,
  "active_rules": 8
}
```

#### 6. Service Latency Statistics
```http
GET /api/latency
```

**Response:**
```json
{
  "latency_stats": {
    "api_gateway": {
      "avg_latency_ms": 15.2,
      "min_latency_ms": 8.1,
      "max_latency_ms": 45.3,
      "total_requests": 1250
    },
    "health": {
      "avg_latency_ms": 8.1,
      "min_latency_ms": 3.2,
      "max_latency_ms": 22.1,
      "total_requests": 890
    }
  },
  "overall_avg_latency_ms": 12.8
}
```

#### 7. Service List
```http
GET /api/services
```

**Response:**
```json
{
  "services": [
    {
      "name": "api_gateway",
      "port": 5000,
      "status": "running",
      "endpoints": ["/", "/api/health", "/api/prices"]
    },
    {
      "name": "health",
      "port": 5001,
      "status": "running",
      "endpoints": ["/health", "/status", "/metrics"]
    }
  ]
}
```

### Service-Specific Endpoints

#### Health Service (Port 5001)

##### Basic Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600
}
```

##### Detailed Status
```http
GET /status
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "memory_usage": "45.2MB",
  "cpu_usage": "2.1%",
  "active_connections": 15,
  "monitored_services": 5
}
```

##### Service Metrics
```http
GET /metrics
```

**Response:**
```json
{
  "metrics": {
    "response_times": {
      "avg_ms": 8.1,
      "p95_ms": 15.2,
      "p99_ms": 25.3
    },
    "error_rates": {
      "total_errors": 5,
      "error_percentage": 0.1
    },
    "throughput": {
      "requests_per_second": 45.2
    }
  }
}
```

#### Price Feed Service (Port 5002)

##### Get All Prices
```http
GET /prices
```

**Response:**
```json
{
  "prices": {
    "BTC/USDT": {
      "price": 45000.50,
      "timestamp": "2024-01-01T00:00:00Z",
      "source": "binance",
      "volume_24h": 1250000000
    }
  },
  "total_pairs": 25,
  "last_updated": "2024-01-01T00:00:00Z"
}
```

##### Get Specific Symbol Price
```http
GET /prices/BTC/USDT
```

**Response:**
```json
{
  "symbol": "BTC/USDT",
  "price": 45000.50,
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "binance",
  "volume_24h": 1250000000,
  "price_change_24h": 2.5
}
```

##### Service Health
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "connections": {
    "binance_ws": "connected",
    "mock_feeds": "active"
  },
  "active_pairs": 25,
  "last_update": "2024-01-01T00:00:00Z"
}
```

#### Arbitrage Service (Port 5003)

##### Get Recent Signals
```http
GET /signals
```

**Query Parameters:**
- `limit` (optional): Number of signals (default: 50)
- `type` (optional): Signal type filter
- `min_spread` (optional): Minimum spread percentage

**Response:**
```json
{
  "signals": [
    {
      "id": "signal_001",
      "type": "direct",
      "pairs": ["EUR/USD", "USD/EUR"],
      "spread_percentage": 0.15,
      "profit_potential": 0.0015,
      "timestamp": "2024-01-01T00:00:00Z",
      "status": "active",
      "confidence": 0.85
    }
  ],
  "total_signals": 150,
  "active_signals": 25
}
```

##### Get Signal Details
```http
GET /signals/signal_001
```

**Response:**
```json
{
  "id": "signal_001",
  "type": "direct",
  "pairs": ["EUR/USD", "USD/EUR"],
  "spread_percentage": 0.15,
  "profit_potential": 0.0015,
  "timestamp": "2024-01-01T00:00:00Z",
  "status": "active",
  "confidence": 0.85,
  "execution_time": "2024-01-01T00:00:05Z",
  "profit_realized": 0.0012
}
```

##### Arbitrage Statistics
```http
GET /stats
```

**Response:**
```json
{
  "statistics": {
    "total_signals": 150,
    "active_signals": 25,
    "executed_signals": 45,
    "total_profit": 0.0250,
    "success_rate": 0.78
  },
  "performance": {
    "avg_spread": 0.12,
    "max_spread": 0.45,
    "avg_execution_time": 2.3
  },
  "by_type": {
    "direct": 120,
    "triangular": 30
  }
}
```

#### CEP Engine Service (Port 5004)

##### Get All Rules
```http
GET /rules
```

**Response:**
```json
{
  "rules": [
    {
      "id": "rule_001",
      "name": "Price Spike Detection",
      "description": "Detect sudden price increases",
      "pattern": {
        "condition": "price_change > 5%",
        "timeframe": "5m",
        "symbols": ["BTC/USDT", "ETH/USDT"]
      },
      "action": "generate_alert",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "last_triggered": "2024-01-01T00:00:00Z"
    }
  ],
  "total_rules": 10,
  "active_rules": 8
}
```

##### Create New Rule
```http
POST /rules
Content-Type: application/json

{
  "name": "Volume Surge Detection",
  "description": "Detect unusual volume increases",
  "pattern": {
    "condition": "volume_change > 200%",
    "timeframe": "10m",
    "symbols": ["BTC/USDT"]
  },
  "action": "generate_signal"
}
```

##### Update Rule
```http
PUT /rules/rule_001
Content-Type: application/json

{
  "name": "Updated Price Spike Detection",
  "pattern": {
    "condition": "price_change > 3%",
    "timeframe": "3m"
  }
}
```

##### Test Rule
```http
POST /rules/rule_001/test
Content-Type: application/json

{
  "test_data": {
    "BTC/USDT": {
      "price": 45000,
      "price_change": 6.2,
      "timestamp": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Response:**
```json
{
  "rule_id": "rule_001",
  "test_result": "triggered",
  "matched_conditions": ["price_change > 5%"],
  "action_executed": "generate_alert",
  "test_timestamp": "2024-01-01T00:00:00Z"
}
```

## 🔐 Authentication

Currently, the API uses basic authentication. Future versions will include:

- JWT token authentication
- API key management
- Rate limiting
- Role-based access control

## 📊 Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service is currently unavailable",
    "details": "Health service is not responding",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SERVICE_UNAVAILABLE` | 503 | Service is not available |
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `TIMEOUT` | 408 | Request timeout |

## 📈 Rate Limiting

Rate limiting is planned for future versions:

- **API Gateway**: 1000 requests/minute per IP
- **WebSocket**: 100 connections per IP
- **Individual Services**: Service-specific limits

## 🔄 WebSocket Examples

### JavaScript Client Example
```javascript
import io from 'socket.io-client';

class ASCEPClient {
  constructor(url) {
    this.socket = io(url, {
      transports: ['websocket', 'polling']
    });
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to ASCEP');
      this.subscribeToPrices(['BTC/USDT', 'ETH/USDT']);
      this.subscribeToSignals();
    });

    this.socket.on('price_update', (data) => {
      console.log('Price update:', data);
      this.handlePriceUpdate(data);
    });

    this.socket.on('arbitrage_signal', (signal) => {
      console.log('Arbitrage signal:', signal);
      this.handleArbitrageSignal(signal);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from ASCEP');
    });
  }

  subscribeToPrices(symbols) {
    this.socket.emit('subscribe_prices', { symbols });
  }

  subscribeToSignals() {
    this.socket.emit('subscribe_signals');
  }

  handlePriceUpdate(data) {
    // Handle price update
  }

  handleArbitrageSignal(signal) {
    // Handle arbitrage signal
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Usage
const client = new ASCEPClient('https://your-railway-url.railway.app');
```

### Python Client Example
```python
import socketio
import asyncio

class ASCEPClient:
    def __init__(self, url):
        self.sio = socketio.AsyncClient()
        self.url = url
        self.setup_handlers()

    def setup_handlers(self):
        @self.sio.event
        async def connect():
            print('Connected to ASCEP')
            await self.sio.emit('subscribe_prices', {'symbols': ['BTC/USDT']})
            await self.sio.emit('subscribe_signals')

        @self.sio.event
        async def price_update(data):
            print('Price update:', data)

        @self.sio.event
        async def arbitrage_signal(signal):
            print('Arbitrage signal:', signal)

        @self.sio.event
        async def disconnect():
            print('Disconnected from ASCEP')

    async def connect(self):
        await self.sio.connect(self.url)

    async def disconnect(self):
        await self.sio.disconnect()

# Usage
async def main():
    client = ASCEPClient('https://your-railway-url.railway.app')
    await client.connect()
    await asyncio.sleep(60)  # Keep connection alive
    await client.disconnect()

asyncio.run(main())
```

## 📝 SDK Libraries

Future SDK libraries will be available for:

- **JavaScript/TypeScript**: `@ascep/client`
- **Python**: `ascep-client`
- **Go**: `github.com/ascep/client`
- **Java**: `com.ascep.client`

## 🔧 Development

### Local Development
```bash
# Start all services
./start_docker.sh

# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/prices
```

### API Testing
```bash
# Test WebSocket connection
wscat -c ws://localhost:5000

# Test individual services
curl http://localhost:5001/health
curl http://localhost:5002/prices
curl http://localhost:5003/signals
curl http://localhost:5004/rules
```

## 📚 Additional Resources

- [Microservices Architecture](./MICROSERVICES-README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Development Guide](./DEVELOPMENT.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md) 