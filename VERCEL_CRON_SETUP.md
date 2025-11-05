# Vercel Cron Setup Guide

## Overview

This project now supports **both local and Vercel cron execution**:
- **Local Development**: Uses `node-cron` to execute at 45 seconds of every minute
- **Vercel Production**: Uses Vercel Cron to execute every minute via `/api/cron` endpoint

## Files Created/Modified

### New Files
- **`api/cron.js`** - Vercel cron endpoint handler

### Modified Files
- **`vercel.json`** - Added cron configuration
- **`api/index.js`** - Conditional cron initialization based on environment

## Vercel Cron Configuration

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "* * * * *"
    }
  ]
}
```

### Schedule Format
- **`* * * * *`** - Executes every minute
- Vercel Cron uses standard cron syntax (minute-level granularity only)
- **Note**: Vercel Cron does NOT support second-level precision like `node-cron`

### Why Every Minute Instead of 45 Seconds?

Vercel Cron has **minute-level granularity** only. It cannot execute at specific seconds (like 45 seconds).

**Options:**
1. **Current Setup**: Execute every minute (Vercel limitation)
2. **Alternative**: Use external cron service (cron-job.org, EasyCron) for second-level precision
3. **Workaround**: Add delay logic inside the handler to wait until 45 seconds

## How It Works

### Local Development
```bash
npm run dev
```
- Detects `process.env.VERCEL !== '1'`
- Starts `node-cron` scheduler
- Executes at **45 seconds** of every minute
- Full control over timing

### Vercel Production
```bash
vercel deploy
```
- Detects `process.env.VERCEL === '1'`
- Skips local cron initialization
- Vercel calls `/api/cron` endpoint every minute
- Executes betting round logic via HTTP request

## API Endpoint: `/api/cron`

### Purpose
Serverless function triggered by Vercel Cron

### Request
- **Method**: `POST` or `GET`
- **URL**: `https://your-domain.vercel.app/api/cron`
- **Headers**: Standard Vercel Cron headers

### Response
```json
{
  "success": true,
  "message": "Betting round processed successfully",
  "timestamp": "2024-11-05T06:15:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Failed to process betting round",
  "message": "Error details...",
  "timestamp": "2024-11-05T06:15:00.000Z"
}
```

## Deployment Steps

### 1. Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Verify Cron Setup
After deployment, check Vercel Dashboard:
1. Go to your project
2. Navigate to **Settings** → **Cron Jobs**
3. Verify the cron job is listed and active

### 5. Monitor Execution
- Go to **Deployments** → **Functions**
- Click on `/api/cron` function
- View logs to see execution history

## Environment Variables

Make sure these are set in Vercel:
```bash
MONGODB_URI=your_mongodb_connection_string
PORT=4000
# Add any other required environment variables
```

Set them in Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add each variable
3. Redeploy if needed

## Testing

### Test Locally
```bash
npm run dev
# Watch console for cron execution at 45 seconds
```

### Test Vercel Endpoint Manually
```bash
curl -X POST https://your-domain.vercel.app/api/cron
```

### Check Logs
```bash
vercel logs your-deployment-url
```

## Important Notes

### ⚠️ Timing Difference
- **Local**: Executes at **45 seconds** of every minute
- **Vercel**: Executes at **start of every minute** (00 seconds)

If you need exact 45-second timing on Vercel, consider:

#### Option 1: Add Delay in Handler
```javascript
// In api/cron.js
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (req, res) => {
  // Wait until 45 seconds
  const now = new Date();
  const currentSeconds = now.getSeconds();
  const waitMs = currentSeconds < 45 
    ? (45 - currentSeconds) * 1000 
    : (105 - currentSeconds) * 1000;
  
  await delay(waitMs);
  
  // Now execute at 45 seconds
  // ... rest of the code
};
```

#### Option 2: Use External Cron Service
Use services like:
- **cron-job.org** (free, supports second-level precision)
- **EasyCron** (paid, very reliable)
- **AWS EventBridge** (if using AWS)

Configure them to call your endpoint at 45 seconds.

### 🔒 Security Considerations

#### Add Authentication (Recommended)
```javascript
// In api/cron.js
module.exports = async (req, res) => {
  // Verify request is from Vercel Cron
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... rest of the code
};
```

Set `CRON_SECRET` in Vercel environment variables and configure it in Vercel Cron settings.

### 📊 Monitoring

Monitor cron execution:
1. **Vercel Logs**: Real-time function logs
2. **Database**: Check `roundresults` collection for new entries
3. **Health Endpoint**: `GET /health` shows cron status

### 🐛 Troubleshooting

#### Cron Not Executing
- Check Vercel Dashboard → Cron Jobs (is it enabled?)
- Verify `vercel.json` syntax is correct
- Check function logs for errors
- Ensure environment variables are set

#### Database Connection Issues
- Verify `MONGODB_URI` is set in Vercel
- Check MongoDB Atlas whitelist (allow Vercel IPs or use 0.0.0.0/0)
- Test connection manually via `/api/cron` endpoint

#### Wrong Timing
- Remember: Vercel Cron is minute-level only
- Implement delay logic if you need 45-second precision
- Consider external cron service for exact timing

## Code Flow

### Local Environment
```
Server Start → Check VERCEL env → Not Vercel → Start node-cron → Execute at :45
```

### Vercel Environment
```
Vercel Cron (every minute) → POST /api/cron → Execute processBettingRound()
```

## Rollback Plan

If you need to disable Vercel Cron:

1. **Remove from vercel.json**:
```json
{
  "version": 2,
  "rewrites": [...],
  "buildCommand": ""
  // Remove "crons" section
}
```

2. **Redeploy**:
```bash
vercel --prod
```

3. **Use External Service**: Point external cron to `/api/cron`

## Summary

✅ **What's Working**:
- Local development with `node-cron` at 45 seconds
- Vercel production with Vercel Cron every minute
- Conditional initialization (no conflicts)
- Same betting logic for both environments
- Existing code flow preserved

⚠️ **Limitations**:
- Vercel Cron: minute-level precision only (not 45 seconds)
- Cold starts may add latency on Vercel

🚀 **Next Steps**:
1. Deploy to Vercel
2. Monitor first few executions
3. Add authentication to `/api/cron` endpoint
4. Consider external cron if 45-second precision is critical

---

**Created**: November 5, 2024  
**Compatibility**: Works with existing cron setup without breaking changes
