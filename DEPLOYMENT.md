# ASCEP Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Railway (Easiest - 5 minutes)
**Perfect for: Quick demo, testing, small projects**

1. **Fork/Clone** this repository
2. **Sign up** at [Railway.app](https://railway.app)
3. **Connect** your GitHub repository
4. **Add Redis service** in Railway dashboard
5. **Deploy** - Railway will auto-detect and deploy

**Cost**: Free tier available, then $5/month

### Option 2: Docker + VPS (Recommended)
**Perfect for: Production, full control, scaling**

1. **Get a VPS** (DigitalOcean, Linode, AWS EC2)
2. **Install Docker** and Docker Compose
3. **Clone** this repository
4. **Set environment variables**:
   ```bash
   export SECRET_KEY="your-secret-key"
   export ALPHA_VANTAGE_API_KEY="your-api-key"
   ```
5. **Deploy**:
   ```bash
   docker-compose up -d
   ```

**Cost**: $5-20/month depending on VPS

### Option 3: Vercel + Railway (Modern Stack)
**Perfect for: Best performance, global CDN**

1. **Deploy backend** to Railway
2. **Deploy frontend** to Vercel
3. **Update** `vercel.json` with your Railway URL
4. **Configure** environment variables

**Cost**: Free tier available

## 🔧 Environment Variables

Create a `.env` file or set in your deployment platform:

```bash
# Required
SECRET_KEY=your-super-secret-key-here
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional (for stock/forex data)
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key

# Optional (for production)
DEBUG=False
PORT=5000
```

## 🌐 Domain & SSL Setup

### Automatic SSL (Recommended)
- **Railway**: Automatic SSL with custom domains
- **Vercel**: Automatic SSL with custom domains
- **Docker**: Use Let's Encrypt with certbot

### Manual SSL Setup
1. **Get SSL certificate** (Let's Encrypt is free)
2. **Update nginx.conf** with your certificate paths
3. **Restart** nginx service

## 📊 Monitoring & Health Checks

### Built-in Health Checks
- **Backend**: `GET /api/health`
- **Frontend**: `GET /health`
- **Redis**: Automatic ping checks

### External Monitoring
- **Uptime Robot**: Free uptime monitoring
- **StatusCake**: Advanced monitoring
- **Custom**: Use the health endpoints

## 🔒 Security Considerations

### Production Security
1. **Change default SECRET_KEY**
2. **Use HTTPS only**
3. **Set up rate limiting** (included in nginx.conf)
4. **Enable CORS** for your domain only
5. **Use environment variables** for sensitive data

### API Security
- **Rate limiting**: 10 requests/second for API
- **WebSocket limits**: 100 connections/second
- **Input validation**: All endpoints validated
- **SQL injection protection**: Using parameterized queries

## 📈 Scaling Considerations

### Horizontal Scaling
- **Multiple Celery workers**: Add more worker containers
- **Load balancing**: Use nginx upstream
- **Redis clustering**: For high-traffic scenarios

### Vertical Scaling
- **Increase VPS resources**: CPU, RAM, storage
- **Optimize database**: Redis configuration
- **CDN**: Use Cloudflare or similar

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Redis connection
redis-cli ping

# Check logs
docker-compose logs backend
```

**Frontend not loading:**
```bash
# Check build
npm run build

# Check nginx logs
docker-compose logs nginx
```

**WebSocket connection failed:**
```bash
# Check CORS settings
# Verify nginx WebSocket proxy
# Check browser console for errors
```

### Performance Issues
1. **Enable Redis persistence**
2. **Optimize Celery worker count**
3. **Use CDN for static assets**
4. **Monitor memory usage**

## 🚀 Production Checklist

- [ ] **Environment variables** set
- [ ] **SSL certificate** installed
- [ ] **Domain** configured
- [ ] **Health checks** working
- [ ] **Monitoring** set up
- [ ] **Backup strategy** in place
- [ ] **Rate limiting** enabled
- [ ] **Error logging** configured
- [ ] **Performance monitoring** active

## 💰 Cost Optimization

### Free Tier Options
- **Railway**: $5/month after free tier
- **Vercel**: Free for personal projects
- **Netlify**: Free tier available
- **Heroku**: Free tier discontinued

### Paid Options
- **DigitalOcean**: $5-20/month
- **AWS**: Pay-as-you-go
- **Google Cloud**: Free tier + pay-as-you-go
- **Azure**: Free tier + pay-as-you-go

## 📞 Support

For deployment issues:
1. **Check logs** in your deployment platform
2. **Verify environment variables**
3. **Test locally** first
4. **Check network connectivity**
5. **Review security settings**

Your ASCEP platform is production-ready! 🎉 