# Vercel Frontend Deployment Guide

## 🚀 Quick Deploy Steps:

### 1. Install Vercel CLI
```bash
pnpm add -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy Frontend
```bash
cd frontend
vercel --prod
```

## ⚙️ Configuration:

### Update vercel.json with your Railway URL:
Replace `https://your-railway-app.railway.app` with your actual Railway backend URL.

### Environment Variables:
Set in Vercel dashboard or via CLI:
```bash
vercel env add REACT_APP_API_URL
# Enter your Railway URL: https://your-app.railway.app
```

## 🔧 Manual Setup (Alternative):

### 1. Go to [vercel.com](https://vercel.com)
### 2. Click "New Project"
### 3. Import your GitHub repository
### 4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `build`

### 5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your Railway backend URL

## ✅ Verification:

After deployment, your app should:
- ✅ Load the React frontend
- ✅ Connect to Railway backend
- ✅ Show real-time data
- ✅ Display health status

## 🔗 URLs:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.railway.app
- **Health Check**: https://your-app.railway.app/api/health

## 🎉 Benefits:
- **Global CDN** for fast loading
- **Automatic SSL**
- **Auto-scaling**
- **Separate from backend** for better performance 