# 🚀 Quick Start Guide - Color Betting Cron

## ✅ Installation Complete!

Your color betting cron job has been successfully set up following the backend example structure.

## 📁 What Was Added

```
color-trading-be/
├── src/
│   ├── cronJobs/                          ← NEW FOLDER
│   │   ├── colorBettingCron.js           ← Main cron job
│   │   └── README.md                     ← Detailed docs
│   ├── modal/
│   │   └── roundResultModal.js           ← NEW: Round results schema
│   ├── db/
│   │   └── roundResult/                  ← NEW FOLDER
│   │       └── roundResult.db.processor.js
│   ├── service/
│   │   └── roundResultService.js         ← NEW: Business logic
│   ├── controller/
│   │   └── roundResult/                  ← NEW FOLDER
│   │       ├── getRoundResultController.js
│   │       ├── getLatestResultsController.js
│   │       ├── getCurrentRoundController.js
│   │       └── index.js
│   └── routes/
│       └── roundResultRoutes.js          ← NEW: API routes
├── api/
│   └── index.js                          ← UPDATED: Added cron init
├── CRON_SETUP_SUMMARY.md                 ← Complete setup guide
├── CRON_FLOW_DIAGRAM.md                  ← Visual flow diagram
└── test-cron.js                          ← Test script
```

## 🎯 How to Start

### 1. Start the Server
```bash
npm start
```

You should see:
```
API is listening on port 4000
Color betting cron job is active - executes at 45 seconds of every minute
Color betting cron job started - executes at 45 seconds of every minute (IST)
```

### 2. Verify Cron is Running
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "message": "Health Check",
  "code": 200,
  "cronStatus": {
    "isRunning": true,
    "isProcessing": false,
    "nextExecution": "Every minute at 45 seconds (IST)"
  }
}
```

### 3. Run Test Script (Optional)
```bash
node test-cron.js
```

This will show you:
- Current round number
- When cron will execute next
- Sample color generation
- Payout calculations
- Live countdown to next execution

## 🎮 Testing the Complete Flow

### Step 1: Get Current Round Number
```bash
curl http://localhost:4000/round/current
```

Response:
```json
{
  "roundNumber": 870,
  "timestamp": "2024-11-03T14:30:15.000Z",
  "secondsRemaining": 30
}
```

### Step 2: Place a Bet
```bash
curl -X POST http://localhost:4000/bet/updateColorHistory \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "roundNumber": 870,
    "color": "red",
    "amount": 100,
    "status": "pending"
  }'
```

### Step 3: Wait for 45 Seconds
Watch your server logs. At 45 seconds, you'll see:
```
Processing round #870 at 14:30:45
Found 1 bets for round #870
Winning color for round #870: red
Processed bet abc123: User your-user-id, red, WON, Payout: 200
Updated balance for user your-user-id: +200 (New balance: 1200)
Successfully processed round #870 - Winners: 1, Total Payout: 200
```

### Step 4: Check Results
```bash
curl http://localhost:4000/round/latest
```

Response:
```json
[
  {
    "roundNumber": 870,
    "winningColor": "red",
    "timestamp": "2024-11-03T14:30:45.000Z",
    "totalBets": 1,
    "totalAmount": 100,
    "winnersCount": 1,
    "totalPayout": 200
  }
]
```

## 📊 Understanding the System

### Timing
- **Betting Window**: 0-44 seconds of each minute
- **Betting Closes**: At 45 seconds
- **Processing**: Happens at 45 seconds
- **New Round**: Starts at 46 seconds

### Round Numbers
- Calculated as: `(hours × 60) + minutes`
- Example: 14:30 = Round #870
- Example: 09:15 = Round #555

### Payouts
- **Red/Green Win**: 2x your bet
- **Black Win**: 10x your bet (rare)
- **Lose**: Bet amount already deducted

### Probabilities
- **Red**: 45% chance
- **Green**: 45% chance
- **Black**: 10% chance

## 🔗 New API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health + cron status |
| `/round/current` | GET | Current round info |
| `/round/latest` | GET | Latest round results (default 10) |
| `/round/:roundNumber` | GET | Specific round result |

## 🎨 Example Betting Scenario

```
Time: 14:30:00
User places bet: 100 on RED (Round 870)
User balance: 1000 → 900 (bet deducted)

Time: 14:30:45
Cron executes
Winning color: RED 🔴

Result: WIN!
Payout: 200
User balance: 900 → 1100 (payout added)
Net profit: +100
```

## 🛠️ Configuration

All settings are in `src/cronJobs/colorBettingCron.js`:

```javascript
// Change execution time (currently 45 seconds)
cron.schedule('45 * * * * *', ...)

// Change timezone (currently IST)
timezone: 'UTC'

// Change payouts
const winMultiplier = 2;      // Red/Green
const blackMultiplier = 10;   // Black

// Change probabilities
if (random < 45) return 'red';    // 45%
if (random < 90) return 'green';  // 45%
return 'black';                   // 10%
```

## 📚 Documentation Files

- **CRON_SETUP_SUMMARY.md** - Complete setup details
- **CRON_FLOW_DIAGRAM.md** - Visual flow diagrams
- **src/cronJobs/README.md** - Technical documentation
- **QUICK_START.md** - This file

## ✨ Key Features

✅ **Automatic Processing** - Runs every minute at 45 seconds  
✅ **Fair Random** - Weighted color generation  
✅ **Balance Updates** - Automatic winner payouts  
✅ **Result History** - All rounds saved to database  
✅ **Graceful Shutdown** - Safe server stops  
✅ **Error Handling** - Individual bet failures don't stop processing  
✅ **Monitoring** - Health check and status endpoints  
✅ **IST Timezone** - Indian Standard Time support  

## 🐛 Troubleshooting

### Cron Not Running
```bash
# Check if dependencies installed
npm list node-cron moment-timezone

# Restart server
npm start
```

### Bets Not Processing
- Ensure bet status is `"pending"`
- Verify roundNumber matches current round
- Check server logs for errors

### Wrong Payouts
- Review multipliers in code
- Check bet amounts
- Verify winning color

## 📞 Need Help?

1. Check server logs for error messages
2. Review `src/cronJobs/README.md` for details
3. Run `node test-cron.js` to verify setup
4. Check `/health` endpoint for cron status

## 🎉 You're All Set!

Your color betting cron job is now active and will automatically process betting rounds every minute at 45 seconds!

**Next Steps:**
1. Start your server: `npm start`
2. Test with a bet
3. Watch the magic happen at 45 seconds! ✨

---

**Created**: November 3, 2024  
**Pattern**: Follows `color-trading-ui/backend-example` structure  
**Timezone**: UTC (IST)
