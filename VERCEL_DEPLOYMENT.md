# 🚀 Vercel Deployment Guide

## 📋 **Prerequisites**

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```

## 🎯 **Quick Deploy**

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub** (already done):
   ```bash
   git add .
   git commit -m "Add Vercel compatibility"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Option 2: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## 🌐 **API Endpoints**

Once deployed, your Vercel app will have these endpoints:

```
https://your-app.vercel.app/              # Web interface
https://your-app.vercel.app/api/analyze  # Analysis API
https://your-app.vercel.app/api/health   # Health check
https://your-app.vercel.app/api/capabilities # API info
```

## 📊 **Usage Examples**

### Web Interface
```
https://your-app.vercel.app/
```
- Drag & drop CSV files
- Real-time analysis
- Interactive charts

### API Usage
```javascript
const response = await fetch('https://your-app.vercel.app/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    headers: ['product', 'price', 'sales'],
    sampleData: [
      ['iPhone', 999, 1500],
      ['Samsung', 899, 1200]
    ]
  })
});

const result = await response.json();
console.log(result.data.charts_to_generate);
```

### cURL Example
```bash
curl -X POST https://your-app.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "headers": ["product", "price", "sales"],
    "sampleData": [
      ["iPhone", 999, 1500],
      ["Samsung", 899, 1200]
    ]
  }'
```

## ⚙️ **Configuration**

### Environment Variables (Optional)
Set in Vercel dashboard under Settings > Environment Variables:

```
NODE_ENV=production
MAX_PROCESSING_TIME=30000
```

### Custom Domain (Optional)
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain

## 🔧 **Vercel Configuration**

The `vercel.json` file configures:
- **API Routes**: `/api/*` endpoints
- **Static Files**: Web interface served from `/public`
- **Build Settings**: TypeScript compilation
- **Function Limits**: 30-second timeout for analysis

## 📈 **Performance**

### Vercel Limits
- **Function Timeout**: 30 seconds (sufficient for most datasets)
- **Memory**: 1024MB (handles large CSV files)
- **Request Size**: 10MB (configurable)
- **Concurrent Requests**: Scales automatically

### Optimization Tips
- **Small Datasets**: < 1000 rows for best performance
- **Large Files**: Consider chunking or sampling
- **Caching**: Vercel automatically caches static assets

## 🛠️ **Troubleshooting**

### Build Errors
```bash
# Check build locally
npm run build

# Check TypeScript compilation
npx tsc --noEmit
```

### API Errors
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Check function logs in Vercel dashboard
```

### CORS Issues
The API includes CORS headers for cross-origin requests.

## 🚀 **Deployment Checklist**

- ✅ Repository pushed to GitHub
- ✅ Vercel account created
- ✅ Project connected to Vercel
- ✅ Build successful
- ✅ API endpoints working
- ✅ Web interface accessible
- ✅ CORS configured
- ✅ Error handling tested

## 🎉 **You're Live!**

Your Senior Data Analyst AI is now deployed on Vercel with:
- **Global CDN**: Fast worldwide access
- **Auto-scaling**: Handles traffic spikes
- **HTTPS**: Secure by default
- **Zero Config**: No server management needed

## 📞 **Support**

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Function Logs**: Available in Vercel dashboard
- **GitHub Issues**: For project-specific problems

---

**🎊 Congratulations! Your data analysis tool is now live on the web!**