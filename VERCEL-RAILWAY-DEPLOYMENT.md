# ASCEP Vercel + Railway Deployment Guide

## 🚀 Quick Deploy (10 minutes)

### **Step 1: Deploy Backend to Railway**

1. **Sign up** at [Railway.app](https://railway.app)
2. **Create new project** → "Deploy from GitHub repo"
3. **Connect your GitHub** repository
4. **Add Redis service**:
   - Click "New Service" → "Redis"
   - Railway will auto-configure Redis connection
5. **Deploy backend**:
   - Railway will auto-detect Python backend
   - Set environment variables:
     ```
     SECRET_KEY=your-super-secret-key-here
     REDIS_HOST=your-redis-service-url
     REDIS_PORT=6379
     DEBUG=False
     PORT=5000
     ALPHA_VANTAGE_API_KEY=your-api-key (optional)
     ```
6. **Get your Railway URL**: `https://ascep-backend.railway.app`

### **Step 2: Deploy Frontend to Vercel**

1. **Sign up** at [Vercel.com](https://vercel.com)
2. **Import project** from GitHub
3. **Configure build settings**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. **Set environment variables**:
   ```
   REACT_APP_API_URL=https://ascep-backend.railway.app
   ```
5. **Deploy** - Vercel will build and deploy automatically

## 🔧 Manual Setup (Alternative)

### **Backend Setup (Railway)**

1. **Create Railway project**
2. **Add Redis service**
3. **Deploy backend code**:
   ```bash
   # Railway will auto-detect and deploy
   # Make sure backend/requirements.txt exists
   ```

4. **Set environment variables** in Railway dashboard:
   ```
   SECRET_KEY=your-secret-key
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   DEBUG=False
   PORT=5000
   ```

### **Frontend Setup (Vercel)**

1. **Create Vercel project**
2. **Configure build**:
   - **Root Directory**: `frontend`
   - **Framework**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Set environment variable**:
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.railway.app
   ```

## 🌐 Domain Setup

### **Custom Domain (Optional)**

**Railway (Backend):**
- Go to Railway dashboard → Settings → Domains
- Add custom domain: `api.yourdomain.com`
- Railway provides SSL automatically

**Vercel (Frontend):**
- Go to Vercel dashboard → Settings → Domains
- Add custom domain: `yourdomain.com`
- Vercel provides SSL automatically

## 📊 Monitoring & Management

### **Railway Backend**
- **Logs**: Railway dashboard → Logs tab
- **Metrics**: CPU, memory, network usage
- **Health checks**: Automatic monitoring
- **Restart**: One-click restart in dashboard

### **Vercel Frontend**
- **Analytics**: Built-in performance monitoring
- **Logs**: Function logs in dashboard
- **Deployments**: Automatic from Git pushes
- **Preview**: Automatic preview deployments

## 🔒 Security Features

### **Railway Security**
- **Automatic SSL** for all domains
- **Environment variables** encryption
- **Private networking** between services
- **Rate limiting** built-in

### **Vercel Security**
- **Automatic SSL** with Let's Encrypt
- **DDoS protection** included
- **Edge caching** for performance
- **Security headers** automatically set

## 💰 Cost Breakdown

### **Free Tiers**

**Railway:**
- **$5 credit** monthly (free tier)
- **Backend**: ~$5-10/month after free tier
- **Redis**: ~$5/month after free tier

**Vercel:**
- **Frontend**: FREE for personal projects
- **Custom domains**: FREE
- **SSL certificates**: FREE
- **CDN**: FREE

### **Total Cost**
- **Free tier**: $0/month (limited usage)
- **After free tier**: $10-15/month total

## 🚨 Troubleshooting

### **Common Issues**

**Backend not starting:**
```bash
# Check Railway logs
# Verify environment variables
# Check Redis connection
```

**Frontend build failing:**
```bash
# Check Vercel build logs
# Verify package.json
# Check for missing dependencies
```

**WebSocket connection failed:**
```bash
# Verify REACT_APP_API_URL is set
# Check CORS settings in backend
# Verify Railway URL is correct
```

**API calls failing:**
```bash
# Check Railway backend logs
# Verify API endpoints
# Check environment variables
```

## 📈 Performance Optimization

### **Vercel Optimizations**
- **Automatic image optimization**
- **Edge caching** for static assets
- **CDN** distribution worldwide
- **Automatic compression**

### **Railway Optimizations**
- **Auto-scaling** based on load
- **Container optimization**
- **Database connection pooling**
- **Caching strategies**

## 🔄 Continuous Deployment

### **Automatic Deployments**
- **GitHub integration** for both platforms
- **Automatic builds** on push to main
- **Preview deployments** for pull requests
- **Rollback** to previous versions

### **Environment Management**
- **Production**: Main branch
- **Staging**: Develop branch
- **Preview**: Pull requests

## 🎯 Success Checklist

- [ ] **Railway backend** deployed and running
- [ ] **Redis service** connected
- [ ] **Environment variables** set
- [ ] **Vercel frontend** deployed
- [ ] **API URL** configured correctly
- [ ] **WebSocket connection** working
- [ ] **Custom domain** configured (optional)
- [ ] **SSL certificates** active
- [ ] **Health checks** passing
- [ ] **Monitoring** set up

## 🚀 Quick Commands

### **Update Backend**
```bash
# Push to GitHub - Railway auto-deploys
git push origin main
```

### **Update Frontend**
```bash
# Push to GitHub - Vercel auto-deploys
git push origin main
```

### **Check Status**
- **Backend**: Railway dashboard
- **Frontend**: Vercel dashboard
- **Health**: `https://your-backend.railway.app/api/health`

Your ASCEP platform will be live on Vercel + Railway! 🌐 