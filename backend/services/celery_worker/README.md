# ASCEP Celery Worker Service

The Celery Worker service provides distributed, asynchronous task processing for the ASCEP platform.

## Purpose
- Offload heavy or long-running tasks from API and other services
- Enable scalable, parallel background processing
- Support for real-time and batch jobs

## Port
- **Port**: 5005 (for health and task status endpoints)

## Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service information |
| `/health` | GET | Health check |
| `/tasks` | GET | List running/completed tasks |
| `/tasks` | POST | Submit a new async task |
| `/stats` | GET | Worker statistics |

## Features
- Distributed task queue using Celery
- Redis as broker and result backend
- Scalable: run multiple workers for higher throughput
- Can be called from any service (via HTTP or Celery client)
- Monitors and exposes task status and stats

## Example Tasks
- Heavy rule evaluation
- Signal processing
- Notifications
- Data enrichment

## How to Use
1. **Define tasks** in `celery_worker.py` (see code for examples)
2. **Call tasks** from any service:
   - Directly via Celery client (recommended for Python-to-Python)
   - Or via HTTP POST to `/tasks` endpoint
3. **Monitor** via `/tasks` and `/stats` endpoints

## Running
```bash
cd backend/services/celery_worker
pip install -r requirements.txt
celery -A celery_worker.celery_app worker --loglevel=info
# (Optional) Run HTTP API for health/stats:
python main.py
```

## Environment Variables
- `REDIS_URL` - Redis connection URL
- `SECRET_KEY` - Flask secret key

## Example: Add a New Task
```python
from celery_worker import celery_app

@celery_app.task
def my_async_task(arg1, arg2):
    # Do work here
    return result
```

## Example: Call a Task from Another Service
```python
from celery import Celery
celery_app = Celery(broker=..., backend=...)
celery_app.send_task('celery_worker.my_async_task', args=[1, 2])
```

## Scaling
- Run multiple Celery worker processes for higher throughput
- Use Redis as a shared broker and backend

## Monitoring
- `/tasks` endpoint for task status
- `/stats` endpoint for worker stats
- Integrate with Flower or Prometheus for advanced monitoring 