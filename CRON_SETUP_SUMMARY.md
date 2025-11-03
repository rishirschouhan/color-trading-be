# Color Trading Cron Job - Setup Summary

## ✅ What Was Created

### 1. **Dependencies Installed**
- `node-cron` - For scheduling cron jobs
- `moment-timezone` - For timezone handling (IST)

### 2. **New Files Created**

#### Models
- `src/modal/roundResultModal.js` - Stores winning color and round statistics

#### Database Processors
- `src/db/roundResult/roundResult.db.processor.js` - Database operations for round results

#### Cron Job
- `src/cronJobs/colorBettingCron.js` - Main cron job that executes at 45 seconds every minute
- `src/cronJobs/README.md` - Comprehensive documentation

#### Services
- `src/service/roundResultService.js` - Business logic for round results

#### Controllers
- `src/controller/roundResult/getRoundResultController.js`
- `src/controller/roundResult/getLatestResultsController.js`
- `src/controller/roundResult/getCurrentRoundController.js`
- `src/controller/roundResult/index.js`

#### Routes
- `src/routes/roundResultRoutes.js` - API endpoints for round results

### 3. **Modified Files**
- `api/index.js` - Added cron initialization and graceful shutdown
- `src/routes/index.js` - Added round result routes

## 🎯 How It Works

### Execution Schedule
- **Runs at**: 45 seconds of every minute
- **Timezone**: UTC (IST)
- **Example**: 14:30:45, 14:31:45, 14:32:45...

### Process Flow
1. **At 45 seconds**: Cron job triggers
2. **Collect bets**: Gets all pending bets for current round
3. **Generate winner**: Randomly selects winning color (Red 45%, Green 45%, Black 10%)
4. **Process bets**: Updates each bet status (win/lose)
5. **Update balances**: Adds winnings to user creditCoins
6. **Save results**: Stores round result in database

### Payout Structure
- **Red/Green win**: 2x bet amount
- **Black win**: 10x bet amount (rare)

## 📡 New API Endpoints

```bash
# Get current round info
GET /round/current

# Get latest round results (default 10)
GET /round/latest?limit=20

# Get specific round result
GET /round/:roundNumber

# Health check with cron status
GET /health
```

## 🚀 Starting the Server

```bash
npm start
# or
npm run dev
```

You should see:
```
API is listening on port 4000
Color betting cron job is active - executes at 45 seconds of every minute
Color betting cron job started - executes at 45 seconds of every minute (IST)
```

## 🧪 Testing

### 1. Check Cron Status
```bash
curl http://localhost:4000/health
```

### 2. Get Current Round
```bash
curl http://localhost:4000/round/current
```

### 3. Place a Bet (use existing endpoint)
```bash
POST /bet/updateColorHistory
{
  "userId": "your-user-id",
  "roundNumber": 870,  # Current round number
  "color": "red",
  "amount": 100,
  "status": "pending"
}
```

### 4. Wait for 45 Seconds
Watch the server logs for processing messages

### 5. Check Results
```bash
curl http://localhost:4000/round/latest
```

## 📊 Database Collections

### New Collection: `roundresults`
Stores outcome of each round:
```javascript
{
  roundNumber: 870,
  winningColor: "red",
  timestamp: "2024-11-03T14:30:45.000Z",
  totalBets: 5,
  totalAmount: 500,
  winnersCount: 2,
  totalPayout: 400
}
```

### Updated Collection: `usercolorbethistories`
Bet status now updates from `pending` to `win` or `lose`

## ⚙️ Configuration

### Change Execution Time
In `src/cronJobs/colorBettingCron.js`:
```javascript
// Currently: 45 seconds
cron.schedule('45 * * * * *', ...)

// Change to 30 seconds:
cron.schedule('30 * * * * *', ...)
```

### Change Timezone
```javascript
timezone: 'UTC'  // Change to your timezone
```

### Adjust Payouts
```javascript
const winMultiplier = 2;      // Red/Green payout
const blackMultiplier = 10;   // Black payout
```

### Modify Probabilities
```javascript
// In generateWinningColor()
if (random < 45) return 'red';    // 45%
if (random < 90) return 'green';  // 45%
return 'black';                   // 10%
```

## 🛑 Graceful Shutdown

The cron handles shutdown signals:
- Press `Ctrl+C` to stop
- Cron will complete current processing before stopping

## 📝 Logs to Monitor

```
✅ Color betting cron job started
✅ Processing round #870 at 14:30:45
✅ Found 5 bets for round #870
✅ Winning color for round #870: red
✅ Processed bet 123: User abc, red, WON, Payout: 200
✅ Updated balance for user abc: +200 (New balance: 1200)
✅ Successfully processed round #870 - Winners: 2, Total Payout: 400
```

## 🔍 Troubleshooting

### Cron Not Running
- Check if dependencies are installed: `npm list node-cron moment-timezone`
- Verify server started successfully
- Check for error messages in logs

### Bets Not Processing
- Ensure bet status is `pending`
- Verify roundNumber matches current round
- Check database connection
- Review error logs

### Wrong Payouts
- Verify multipliers in code
- Check bet amounts
- Review winning color logic

## 📚 Documentation

Full documentation available in:
- `src/cronJobs/README.md` - Detailed cron documentation
- This file - Quick setup summary

## 🎉 Success Indicators

Your cron is working correctly if you see:
1. ✅ Server starts with cron active message
2. ✅ Every minute at 45 seconds, processing logs appear
3. ✅ Bet statuses update from `pending` to `win`/`lose`
4. ✅ User balances increase for winning bets
5. ✅ Round results saved in database
6. ✅ `/health` endpoint shows cron status

## 📞 Next Steps

1. **Test the cron** - Place bets and verify processing
2. **Monitor logs** - Watch for any errors
3. **Adjust settings** - Modify payouts/probabilities as needed
4. **Add WebSocket** - For real-time updates to frontend
5. **Implement analytics** - Track betting patterns
6. **Add admin panel** - Manage cron settings

---

**Created**: November 3, 2024  
**Follows**: Backend example structure from `color-trading-ui/backend-example`
