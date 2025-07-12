# ASCEP Development Guide

Comprehensive guide for developing and contributing to the ASCEP (Arbitrage Signal Complex Event Processing) platform.

## 🚀 Getting Started

### Prerequisites

- **Python**: 3.11+ (recommended)
- **Node.js**: 18+ 
- **Docker**: Latest version
- **pnpm**: Latest version
- **Git**: Latest version
- **Redis**: Latest version (optional for local development)

### Development Environment Setup

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ASCEP
```

#### 2. Choose Your Development Method

**Option A: Docker Development (Recommended)**
```bash
# Start all services with Docker
./start_docker.sh
```

**Option B: Manual Development**
```bash
# Backend setup
cd backend
pip install -r requirements.txt
cd services/api_gateway && pip install -r requirements.txt
cd ../health && pip install -r requirements.txt
cd ../price_feeds && pip install -r requirements.txt
cd ../arbitrage && pip install -r requirements.txt
cd ../cep_engine && pip install -r requirements.txt

# Frontend setup
cd frontend
pnpm install
```

## 🏗️ Project Structure

```
ASCEP/
├── backend/                     # Backend microservices
│   ├── services/
│   │   ├── api_gateway/        # API Gateway (Port 5000)
│   │   │   ├── api_gateway.py  # Main gateway logic
│   │   │   ├── service_registry.py # Service discovery
│   │   │   ├── latency_monitor.py  # Performance monitoring
│   │   │   ├── main.py         # Entry point
│   │   │   ├── requirements.txt # Dependencies
│   │   │   └── Dockerfile      # Container config
│   │   ├── health/             # Health Service (Port 5001)
│   │   ├── price_feeds/        # Price Feed Service (Port 5002)
│   │   ├── arbitrage/          # Arbitrage Service (Port 5003)
│   │   ├── cep_engine/         # CEP Engine Service (Port 5004)
│   │   └── celery_worker/      # Background task processing
│   └── requirements.txt        # Shared dependencies
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Dashboard.js    # Main dashboard
│   │   │   ├── PriceFeed.js    # Price feed component
│   │   │   ├── ArbitrageSignals.js # Arbitrage signals
│   │   │   ├── CEPRules.js     # CEP rules management
│   │   │   ├── Visualizations.js # Charts and graphs
│   │   │   └── Navigation.js   # Navigation component
│   │   ├── App.js             # Main application
│   │   ├── App.css            # Application styles
│   │   └── index.js           # Entry point
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind configuration
├── docker-compose.yml         # Local development setup
├── start_docker.sh           # Docker startup script
├── Dockerfile.railway        # Railway deployment
├── railway.json              # Railway configuration
├── vercel.json               # Vercel configuration
└── supervisord.conf          # Production process management
```

## 🔧 Development Workflow

### Local Development

#### 1. Docker Development (Recommended)

```bash
# Start all services
./start_docker.sh

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

#### 2. Individual Service Development

```bash
# Start Redis (if not using Docker)
redis-server

# Start API Gateway
cd backend/services/api_gateway
python main.py

# Start Health Service (new terminal)
cd backend/services/health
python main.py

# Start Price Feed Service (new terminal)
cd backend/services/price_feeds
python main.py

# Start Arbitrage Service (new terminal)
cd backend/services/arbitrage
python main.py

# Start CEP Engine Service (new terminal)
cd backend/services/cep_engine
python main.py

# Start Frontend (new terminal)
cd frontend
pnpm start
```

### Development URLs

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:5000
- **Health Service**: http://localhost:5001
- **Price Feed Service**: http://localhost:5002
- **Arbitrage Service**: http://localhost:5003
- **CEP Engine Service**: http://localhost:5004
- **Redis**: localhost:6379

## 📝 Coding Standards

### Python (Backend)

#### Code Style
- **Formatter**: Black (line length: 88)
- **Linter**: flake8
- **Type Hints**: Use type hints for all functions
- **Docstrings**: Google-style docstrings

#### Example
```python
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

def process_price_data(
    symbol: str, 
    price: float, 
    timestamp: str
) -> Dict[str, any]:
    """
    Process incoming price data and store in Redis.
    
    Args:
        symbol: Trading pair symbol (e.g., 'BTC/USDT')
        price: Current price
        timestamp: ISO timestamp
        
    Returns:
        Dict containing processed data
        
    Raises:
        ValueError: If price is negative
    """
    if price < 0:
        raise ValueError("Price cannot be negative")
    
    processed_data = {
        'symbol': symbol,
        'price': price,
        'timestamp': timestamp,
        'processed_at': datetime.utcnow().isoformat()
    }
    
    logger.info(f"Processed price data for {symbol}: {price}")
    return processed_data
```

#### File Structure
```
service_name/
├── main.py              # Entry point
├── service_name.py      # Main service logic
├── requirements.txt     # Dependencies
├── Dockerfile          # Container config
└── README.md           # Service documentation
```

### JavaScript/React (Frontend)

#### Code Style
- **Formatter**: Prettier
- **Linter**: ESLint
- **Type Checking**: TypeScript (future)
- **Component Structure**: Functional components with hooks

#### Example
```javascript
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Price Feed Component
 * Displays real-time price data for trading pairs
 */
const PriceFeed = ({ priceData, isConnected }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      toast.error('Connection lost to backend');
    }
  }, [isConnected]);

  const handleSymbolChange = (symbol) => {
    setSelectedSymbol(symbol);
    toast.success(`Switched to ${symbol}`);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Price Feed</h2>
      {/* Component content */}
    </div>
  );
};

export default PriceFeed;
```

#### Component Structure
```javascript
// Component file structure
import React from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // State and effects
  // Event handlers
  // Render logic
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

export default ComponentName;
```

## 🧪 Testing

### Backend Testing

#### Unit Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
cd backend
pytest tests/ -v --cov=services

# Run specific service tests
pytest tests/test_api_gateway.py -v
pytest tests/test_arbitrage.py -v
```

#### Test Structure
```
backend/
├── tests/
│   ├── test_api_gateway.py
│   ├── test_health.py
│   ├── test_price_feeds.py
│   ├── test_arbitrage.py
│   ├── test_cep_engine.py
│   └── conftest.py
```

#### Example Test
```python
import pytest
from unittest.mock import Mock, patch
from backend.services.arbitrage.arbitrage_service import ArbitrageService

class TestArbitrageService:
    @pytest.fixture
    def arbitrage_service(self):
        return ArbitrageService()
    
    def test_detect_arbitrage_opportunity(self, arbitrage_service):
        # Arrange
        price_data = {
            'EUR/USD': 1.0850,
            'USD/EUR': 0.9220
        }
        
        # Act
        result = arbitrage_service.detect_opportunity(price_data)
        
        # Assert
        assert result['opportunity_found'] is True
        assert result['spread_percentage'] > 0
```

### Frontend Testing

#### Unit Tests
```bash
# Run tests
cd frontend
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test PriceFeed.test.js
```

#### Example Test
```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PriceFeed from '../components/PriceFeed';

describe('PriceFeed Component', () => {
  const mockPriceData = {
    'BTC/USDT': { price: 45000, timestamp: '2024-01-01T00:00:00Z' }
  };

  test('renders price feed title', () => {
    render(<PriceFeed priceData={mockPriceData} isConnected={true} />);
    expect(screen.getByText('Price Feed')).toBeInTheDocument();
  });

  test('shows connection status', () => {
    render(<PriceFeed priceData={mockPriceData} isConnected={false} />);
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

#### API Testing
```bash
# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/prices
curl http://localhost:5000/api/signals

# Test WebSocket connection
wscat -c ws://localhost:5000
```

#### End-to-End Testing
```bash
# Start all services
./start_docker.sh

# Run E2E tests (future implementation)
pnpm run test:e2e
```

## 🔄 Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical fixes
- `refactor/component-name` - Code refactoring

### Commit Messages
```
type(scope): description

feat(api-gateway): add latency monitoring
fix(price-feeds): handle WebSocket reconnection
refactor(frontend): improve component structure
docs(readme): update deployment instructions
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes and commit
3. Write tests for new functionality
4. Update documentation
5. Create pull request
6. Code review and approval
7. Merge to `main`

## 🐛 Debugging

### Backend Debugging

#### Logging
```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Use in code
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
```

#### Debug Mode
```bash
# Enable debug mode
export FLASK_DEBUG=1
export DEBUG=true

# Start service with debug
python main.py
```

#### Docker Debugging
```bash
# View service logs
docker-compose logs api_gateway
docker-compose logs price_feeds

# Access container shell
docker-compose exec api_gateway bash

# Check service status
docker-compose ps
```

### Frontend Debugging

#### React Developer Tools
- Install React Developer Tools browser extension
- Use browser dev tools for debugging
- Check console for errors and warnings

#### Debug Mode
```bash
# Start in debug mode
REACT_APP_DEBUG=true pnpm start
```

## 📊 Performance Optimization

### Backend Optimization

#### Redis Optimization
```python
# Connection pooling
import redis
from redis import ConnectionPool

pool = ConnectionPool(host='localhost', port=6379, db=0)
redis_client = redis.Redis(connection_pool=pool)

# Pipeline operations
with redis_client.pipeline() as pipe:
    pipe.set('key1', 'value1')
    pipe.set('key2', 'value2')
    pipe.execute()
```

#### Async Operations
```python
import asyncio
import aiohttp

async def fetch_multiple_prices(symbols):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_price(session, symbol) for symbol in symbols]
        return await asyncio.gather(*tasks)
```

### Frontend Optimization

#### React Optimization
```javascript
// Memoization
import React, { useMemo, useCallback } from 'react';

const ExpensiveComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item));
  }, [data]);

  const handleClick = useCallback((id) => {
    // Handle click
  }, []);

  return <div>{/* Component content */}</div>;
};
```

#### Bundle Optimization
```javascript
// Code splitting
import React, { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

## 🔧 Development Tools

### Recommended VS Code Extensions

#### Python
- Python
- Pylance
- Black Formatter
- Flake8

#### JavaScript/React
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense

#### General
- GitLens
- Docker
- REST Client
- Thunder Client

### VS Code Settings
```json
{
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📚 Documentation

### Code Documentation
- Use docstrings for all functions and classes
- Include type hints
- Document complex algorithms
- Add inline comments for non-obvious code

### API Documentation
- Document all endpoints
- Include request/response examples
- Document error codes
- Keep OpenAPI/Swagger specs updated

### README Files
- Each service should have a README
- Include setup instructions
- Document configuration options
- Provide usage examples

## 🚀 Deployment

### Local Testing
```bash
# Test Docker build
docker-compose build

# Test production build
docker build -f Dockerfile.railway .

# Test frontend build
cd frontend
pnpm build
```

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] Code linting passes
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Health checks implemented
- [ ] Error handling in place

## 🤝 Contributing

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

### Reporting Issues
- Use GitHub issues
- Include detailed reproduction steps
- Provide error logs
- Specify environment details

## 📞 Support

### Getting Help
- Check existing documentation
- Search GitHub issues
- Create a new issue with details
- Join community discussions

### Resources
- [API Documentation](./API-DOCUMENTATION.md)
- [Microservices Architecture](./MICROSERVICES-README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md) 