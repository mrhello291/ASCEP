# ASCEP API Gateway Service

The API Gateway serves as the single entry point for all client requests in the ASCEP microservices architecture.

## Purpose
- Route requests to appropriate microservices
- Handle WebSocket connections
- Aggregate health checks
- Provide unified API interface
- **Proxy all requests using a dynamic service registry**
- **Monitor and expose latency for all proxied requests**

## Port
- **Port**: 5000

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Gateway information |
| `/api/health` | GET | Health check for all services |
| `/api/prices` | GET/POST | Price data operations |
| `/api/signals` | GET/POST | Arbitrage signals operations |
| `/api/rules` | GET/POST | CEP rules operations |
| `/api/tasks` | GET/POST | Celery async task operations |
| `/api/latency` | GET | Latency statistics for all services |
| `/api/services` | GET | List all registered services |

## WebSocket Events
- `connect` - Client connection
- `disconnect` - Client disconnection
- `subscribe_prices` - Subscribe to price updates
- `subscribe_signals` - Subscribe to arbitrage signals

## Service Registry
- All services are registered in `service_registry.py`.
- **To add a new service, just add one line:**
  ```python
  service_registry.register_service(
      name="my_service",
      port=5010,
      endpoints=["/foo", "/bar"],
      description="My new microservice"
  )
  ```
- The gateway will automatically route requests to this service.

## Latency Monitoring
- All proxied requests are timed and recorded.
- **View live stats at `/api/latency`** (supports filtering by service and endpoint).
- Stats include average, min, max, p95, p99 latency, request count, and error rate.
- Data is also stored in Redis for persistence and aggregation.

## Features
- Dynamic service registry for easy service addition
- Latency monitoring and statistics
- WebSocket support
- Redis pub/sub integration
- Scalable, stateless proxy

## Dependencies
- Flask
- Flask-SocketIO
- Flask-CORS
- Redis
- Requests

## Running
```bash
cd backend/services/api_gateway
pip install -r requirements.txt
python main.py
```

## Environment Variables
- `REDIS_URL` - Redis connection URL
- `SECRET_KEY` - Flask secret key
- `RAILWAY_ENVIRONMENT` - Environment identifier

## Example: Add a New Service
1. Implement your service in its own folder (see other services for structure).
2. Register it in `service_registry.py`:
   ```python
   service_registry.register_service(
       name="my_service",
       port=5010,
       endpoints=["/foo", "/bar"],
       description="My new microservice"
   )
   ```
3. The gateway will now route `/api/foo` and `/api/bar` to your new service.

## Example: View Latency Stats
- All stats: `GET /api/latency`
- For a specific service: `GET /api/latency?service=price_feed`
- For a specific endpoint: `GET /api/latency?endpoint=/prices` 