# ASCEP Deployment Guide

This guide will help you deploy ASCEP to Railway (backend) and Vercel (frontend).

## Prerequisites

- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- GitHub repository with your ASCEP code

## Step 1: Deploy Backend to Railway

### 1.1 Connect to Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your ASCEP repository
5. Railway will automatically detect the configuration

### 1.2 Add Redis Service

**Important**: You need to add a Redis service to your Railway project:

1. In your Railway project dashboard, click "New Service"
2. Select "Redis" from the template gallery
3. Railway will automatically provision a Redis instance
4. The Redis connection details will be automatically available as environment variables

### 1.3 Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```bash
# Security (set your own secure key)
SECRET_KEY=your-secure-secret-key-here

# Environment
NODE_ENV=production

# Redis variables will be automatically provided by Railway Redis service:
# REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
```

### 1.4 Deploy

1. Railway will automatically start the deployment
2. Monitor the build logs
3. Wait for the health check to pass at `/api/health`

### 1.5 Get Your Railway URL

Once deployed, Railway will provide a URL like:
`https://your-project-name.railway.app`

## Step 2: Deploy Frontend to Vercel

### 2.1 Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.2 Configure Environment Variables

In Vercel dashboard, go to your project → Settings → Environment Variables and add:

```bash
REACT_APP_API_URL=https://your-railway-url.railway.app
```

### 2.3 Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. You'll get a URL like: `https://your-project.vercel.app`

## Step 3: Update Frontend API URL

After getting your Railway URL, update the frontend environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `REACT_APP_API_URL` with your Railway URL
3. Redeploy the frontend

## Step 4: Test Your Deployment

1. **Backend Health Check**: Visit `https://your-railway-url.railway.app/api/health`
2. **Frontend**: Visit your Vercel URL
3. **Test Features**:
   - Price feeds should load
   - Arbitrage signals should generate
   - Real-time updates should work

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   Railway       │
│   Frontend      │◄──►│   Backend       │◄──►│   Redis         │
│   (React)       │    │   (Python)      │    │   (Service)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Vercel**: Hosts the React frontend
- **Railway Backend**: Hosts all Python microservices
- **Railway Redis**: Provides Redis service for data storage and pub/sub

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Railway URL is correctly set in `REACT_APP_API_URL`
2. **Redis Connection**: Ensure Redis service is added to your Railway project
3. **Build Failures**: Check the build logs in Railway/Vercel

### Debugging

1. **Railway Logs**: Check the deployment logs in Railway dashboard
2. **Vercel Logs**: Check the build logs in Vercel dashboard
3. **Health Check**: Visit `/api/health` endpoint to verify backend status
4. **Redis Connection**: Check if Redis environment variables are available

## Environment Variables Reference

### Railway (Backend)
```bash
# Automatically provided by Railway Redis service:
REDIS_URL=redis://your-redis-service.railway.app:6379
REDIS_HOST=your-redis-service.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Manual configuration:
SECRET_KEY=your-secure-secret-key-here
NODE_ENV=production
```

### Vercel (Frontend)
```bash
REACT_APP_API_URL=https://your-railway-url.railway.app
```

## Monitoring

- **Railway**: Monitor service health and logs in Railway dashboard
- **Vercel**: Monitor frontend performance in Vercel dashboard
- **Health Checks**: Use `/api/health` endpoint to monitor backend status
- **Redis**: Monitor Redis service in Railway dashboard

## Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Railway and Vercel will automatically redeploy
3. Monitor the deployment logs for any issues

## Cost Optimization

- **Railway**: Pay only for what you use (CPU, memory, bandwidth)
- **Vercel**: Free tier available for personal projects
- **Redis**: Railway Redis service included in your Railway usage 