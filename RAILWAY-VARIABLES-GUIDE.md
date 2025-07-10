# Railway Environment Variables Setup Guide

## ✅ Already Added (via CLI):
- `REDIS_URL = ${{ Redis.REDIS_URL }}`
- `REDIS_HOST = ${{ Redis.REDISHOST }}`
- `REDIS_PORT = ${{ Redis.REDISPORT }}`
- `REDIS_PASSWORD = ${{ Redis.REDISPASSWORD }}`
- `REDIS_USER = ${{ Redis.REDISUSER }}`

## 🔧 Still Need to Add (via Dashboard):

### Go to your Railway project dashboard:
1. **Click on your main app service** (not Redis)
2. **Go to "Variables" tab**
3. **Add these variables:**

### Required Variables:
```
PORT = 5000
DEBUG = False
SECRET_KEY = ascep-super-secret-key-2024
```

### Optional Variables (for real data feeds):
```
ALPHA_VANTAGE_API_KEY = your-alpha-vantage-key
BINANCE_API_KEY = your-binance-key
BINANCE_SECRET = your-binance-secret
```

## 🚀 After Adding Variables:
1. **Save all variables**
2. **Redeploy your app** (Railway will auto-deploy)
3. **Check health endpoint**: `/api/health`

## ✅ Verification:
Your app should now show:
- Redis connected successfully
- All endpoints working
- Frontend accessible

## 🔗 Your App URLs:
- **Main app**: https://your-app.railway.app
- **Health check**: https://your-app.railway.app/api/health
- **API docs**: https://your-app.railway.app/api/prices 