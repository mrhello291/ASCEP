# ASCEP Deployment Guide

This guide covers deploying ASCEP to Railway (backend) and Vercel (frontend) with detailed configuration and troubleshooting information.

## 🚀 Deployment Overview

ASCEP uses a hybrid deployment strategy:
- **Backend**: Railway (Docker container with all microservices)
- **Frontend**: Vercel (Static React application)
- **Database**: Redis (built into Railway container)

## 📋 Prerequisites

- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- GitHub repository with your ASCEP code
- Docker (for local testing)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────────────────────────────┐
│   Vercel        │    │   Railway Docker Container              │
│   Frontend      │◄──►│   ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│   (React)       │    │   │  Redis  │ │Supervisor│ │  Nginx  │  │
│                 │    │   │(Port 6379)│ │(Manager) │ │(API Proxy)│  │
│                 │    │   └─────────┘ └─────────┘ └─────────┘  │
│                 │    │   ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│                 │    │   │  API    │ │ Price   │ │Arbitrage│  │
│                 │    │   │Gateway  │ │ Feeds   │ │ Service │  │
│                 │    │   └─────────┘ └─────────┘ └─────────┘  │
│                 │    │   ┌─────────┐ ┌─────────┐              │
│                 │    │   │ Health  │ │  CEP    │              │
│                 │    │   │ Service │ │ Engine  │              │
│                 │    │   └─────────┘ └─────────┘              │
└─────────────────┘    └─────────────────────────────────────────┘
```

## 🚀 Step 1: Deploy Backend to Railway

### 1.1 Connect to Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your ASCEP repository
5. Railway will automatically detect the Docker configuration

### 1.2 Docker Architecture

**Key Features**:
- **Single Container**: All backend services in one Docker container
- **Built-in Redis**: No external Redis service needed
- **Supervisor Management**: All microservices managed by Supervisor
- **Nginx Proxy**: API routing and load balancing
- **Health Checks**: Automatic service monitoring

**Services Included**:
- API Gateway (Port 5000)
- Health Service (Port 5001)
- Price Feed Service (Port 5002)
- Arbitrage Service (Port 5003)
- CEP Engine Service (Port 5004)
- Redis Server (Port 6379)

### 1.3 Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```bash
# Required Environment Variables
SECRET_KEY=your-secure-secret-key-here
NODE_ENV=production

# Optional Redis Configuration (Redis is built into container)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional Service Configuration
RAILWAY_ENVIRONMENT=true
DEBUG=false
```

### 1.4 Deploy

1. Railway will automatically start the deployment using `Dockerfile.railway`
2. Monitor the build logs in Railway dashboard
3. Wait for the health check to pass at `/api/health`
4. Note your Railway URL (e.g., `https://your-project-name.railway.app`)

### 1.5 Verify Deployment

Test your backend deployment:

```bash
# Health check
curl https://your-railway-url.railway.app/api/health

# Service status
curl https://your-railway-url.railway.app/api/services

# Price data
curl https://your-railway-url.railway.app/api/prices
```

## 🚀 Step 2: Deploy Frontend to Vercel

### 2.1 Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `pnpm install`

### 2.2 Configure Environment Variables

In Vercel dashboard, go to your project → Settings → Environment Variables and add:

```bash
# Required: Point to your Railway backend
REACT_APP_API_URL=https://your-railway-url.railway.app

# Optional: Additional configuration
REACT_APP_ENVIRONMENT=production
```

### 2.3 Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. You'll get a URL like: `https://your-project.vercel.app`

### 2.4 Update API URL

After getting your Railway URL, update the frontend environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `REACT_APP_API_URL` with your Railway URL
3. Redeploy the frontend

## 🔧 Configuration Details

### Railway Configuration (`railway.json`)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.railway"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "name": "ascep-frontend",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/frontend/build/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/build/index.html"
    }
  ]
}
```

### Docker Configuration (`Dockerfile.railway`)

- **Base Image**: Python 3.11-slim
- **Services**: All microservices + Redis + Supervisor
- **Port**: 5000 (Railway will override with PORT env var)
- **Process Management**: Supervisor with `supervisord.conf`

## 🔍 Testing Your Deployment

### 1. Backend Health Check

```bash
curl https://your-railway-url.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "api_gateway": "healthy",
    "health": "healthy",
    "price_feeds": "healthy",
    "arbitrage": "healthy",
    "cep_engine": "healthy"
  }
}
```

### 2. Frontend Connection

1. Visit your Vercel URL
2. Check browser console for WebSocket connections
3. Verify real-time price updates are working
4. Test arbitrage signal generation

### 3. WebSocket Testing

```javascript
// Test WebSocket connection
const socket = io('https://your-railway-url.railway.app');

socket.on('connect', () => {
  console.log('Connected to ASCEP backend');
});

socket.on('price_update', (data) => {
  console.log('Price update:', data);
});

socket.on('arbitrage_signal', (signal) => {
  console.log('Arbitrage signal:', signal);
});
```

## 🚨 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptoms**: Frontend can't connect to backend
**Solution**: 
- Verify `REACT_APP_API_URL` is correctly set in Vercel
- Check Railway URL is accessible
- Ensure CORS is properly configured in API Gateway

#### 2. Redis Connection Issues
**Symptoms**: Services fail to start or communicate
**Solution**:
- Redis is built into the Docker container
- Check `REDIS_URL` environment variable
- Verify Redis is running on port 6379

#### 3. Service Startup Failures
**Symptoms**: Health check fails or services don't respond
**Solution**:
- Check Railway logs for service startup errors
- Verify all environment variables are set
- Check port conflicts (Railway handles this automatically)

#### 4. Build Failures
**Symptoms**: Deployment fails during build
**Solution**:
- Check Railway build logs for Python/Node.js errors
- Verify all dependencies are in requirements.txt
- Check for syntax errors in code

### Debugging Steps

1. **Check Railway Logs**:
   ```bash
   # In Railway dashboard
   Project → Deployments → Latest → View Logs
   ```

2. **Check Vercel Logs**:
   ```bash
   # In Vercel dashboard
   Project → Functions → View Function Logs
   ```

3. **Test Individual Services**:
   ```bash
   # Test API Gateway
   curl https://your-railway-url.railway.app/
   
   # Test Health Service
   curl https://your-railway-url.railway.app/api/health
   
   # Test Price Feeds
   curl https://your-railway-url.railway.app/api/prices
   ```

4. **Check Environment Variables**:
   - Railway: Project → Variables
   - Vercel: Project → Settings → Environment Variables

## 🔄 Updates and Maintenance

### Updating Your Deployment

1. **Code Changes**:
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```

2. **Automatic Deployment**:
   - Railway: Automatically deploys on push to main branch
   - Vercel: Automatically deploys on push to main branch

3. **Manual Deployment**:
   ```bash
   # Railway
   railway up
   
   # Vercel
   vercel --prod
   ```

### Environment Variable Updates

1. **Railway**:
   - Go to Project → Variables
   - Add/update variables
   - Redeploy automatically

2. **Vercel**:
   - Go to Project → Settings → Environment Variables
   - Add/update variables
   - Redeploy automatically

## 📊 Monitoring

### Railway Monitoring
- **Service Health**: Automatic health checks
- **Logs**: Real-time log streaming
- **Metrics**: CPU, memory, network usage
- **Alerts**: Automatic failure notifications

### Vercel Monitoring
- **Performance**: Core Web Vitals
- **Analytics**: Page views and user behavior
- **Functions**: Serverless function performance
- **Errors**: JavaScript error tracking

### Custom Monitoring
- **Health Endpoint**: `/api/health` for service status
- **Latency Monitoring**: `/api/latency` for performance metrics
- **Service Discovery**: `/api/services` for service list

## 💰 Cost Optimization

### Railway Costs
- **Pay-per-use**: Only pay for actual usage
- **Auto-scaling**: Automatically scales based on traffic
- **Free tier**: Limited free usage available
- **Optimization**: Use appropriate instance sizes

### Vercel Costs
- **Free tier**: Generous free tier for personal projects
- **Pro plan**: For commercial use with advanced features
- **Edge functions**: Pay only for execution time

### Cost Monitoring
- **Railway**: Dashboard shows current usage and costs
- **Vercel**: Analytics dashboard shows usage metrics
- **Alerts**: Set up spending alerts to avoid surprises

## 🔒 Security Considerations

### Environment Variables
- **Secrets**: Store sensitive data in environment variables
- **Rotation**: Regularly rotate SECRET_KEY
- **Access**: Limit access to production environment variables

### API Security
- **CORS**: Properly configured for your domains
- **Rate Limiting**: Consider implementing rate limiting
- **Validation**: Input validation on all endpoints

### Data Security
- **Redis**: Built into container (no external exposure)
- **HTTPS**: All communications over HTTPS
- **Headers**: Security headers configured in Vercel

## 📈 Scaling Considerations

### Horizontal Scaling
- **Railway**: Automatic scaling based on traffic
- **Vercel**: Global CDN distribution
- **Redis**: Consider external Redis for high availability

### Performance Optimization
- **Caching**: Implement Redis caching strategies
- **CDN**: Vercel provides global CDN
- **Compression**: Enable gzip compression

### Future Enhancements
- **Load Balancing**: Multiple Railway instances
- **Database**: External Redis cluster
- **Monitoring**: Advanced APM tools
- **CI/CD**: Automated testing and deployment 