# Color Betting Cron Job

This cron job automatically processes color betting rounds right after betting closes (at 45 seconds of every minute).

## Overview

The `colorBettingCron.js` executes at **45 seconds of every minute** in Indian Standard Time (IST) to:

1. **Collect all pending bets** for the current round
2. **Generate a winning color** (Red, Green, or Black)
3. **Process all bets** and determine winners/losers
4. **Update user balances** for winning bets
5. **Save round results** to the database

## How It Works

### Round Number Calculation
- Round number = `(hours * 60) + minutes`
- Example: 14:30 = Round #870

### Winning Color Generation
The cron uses weighted randomization:
- **Red**: 45% probability
- **Green**: 45% probability  
- **Black**: 10% probability (rare, higher payout)

### Payout Multipliers
- **Red/Green wins**: 2x the bet amount
- **Black wins**: 10x the bet amount

### Betting Flow
1. User places a bet with status `pending` (via `/bet` endpoint)
2. Bet amount is deducted from user's `creditCoins`
3. At 45 seconds, cron processes the round:
   - Updates bet status to `win` or `lose`
   - If win: adds payout to user's `creditCoins`
   - If lose: no additional action (amount already deducted)

## Database Models

### RoundResult Model
Stores the outcome of each betting round:
```javascript
{
  roundNumber: Number,      // Unique round identifier
  winningColor: String,     // 'red', 'green', or 'black'
  timestamp: Date,          // When the round was processed
  totalBets: Number,        // Number of bets placed
  totalAmount: Number,      // Total amount wagered
  winnersCount: Number,     // Number of winning bets
  totalPayout: Number       // Total amount paid out
}
```

### ColorBetHistory Model (Updated)
User's bet with status tracking:
```javascript
{
  roundNumber: Number,
  color: String,           // 'red', 'green', or 'black'
  amount: Number,
  status: String,          // 'pending', 'win', or 'lose'
  payout: Number,          // Amount won (0 for losses, 2x or 10x for wins)
  timestamp: Date
}
```

## API Endpoints

### Get Current Round Info
```
GET /round/current
```
Returns:
```json
{
  "roundNumber": 870,
  "timestamp": "2024-11-03T14:30:00.000Z",
  "secondsRemaining": 15
}
```

### Get Latest Round Results
```
GET /round/latest?limit=10
```
Returns the last N round results (default: 10, max: 100)

### Get Specific Round Result
```
GET /round/:roundNumber
```
Returns the result for a specific round number

### Health Check with Cron Status
```
GET /health
```
Returns:
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

## Configuration

### Timezone
The cron runs in **UTC** timezone (IST). To change:
```javascript
timezone: 'UTC'  // Change to your timezone
```

### Execution Time
To change when the cron executes (currently 45 seconds):
```javascript
cron.schedule('45 * * * * *', ...)  // Change '45' to desired second
```

### Payout Multipliers
Adjust in `colorBettingCron.js`:
```javascript
const winMultiplier = 2;      // For red/green
const blackMultiplier = 10;   // For black
```

### Color Probabilities
Modify in `generateWinningColor()` method:
```javascript
if (random < 45) return 'red';    // 45%
if (random < 90) return 'green';  // 45%
return 'black';                   // 10%
```

## Graceful Shutdown

The cron job handles graceful shutdown on:
- `SIGTERM` signal
- `SIGINT` signal (Ctrl+C)

This ensures all processing completes before the server stops.

## Logging

The cron logs:
- ✅ Round processing start/completion
- ✅ Number of bets found
- ✅ Winning color generated
- ✅ Individual bet processing results
- ✅ Balance updates
- ⚠️ Warnings for concurrent processing
- ❌ Errors during processing

## Testing

### Manual Testing
1. Start the server: `npm start`
2. Place a bet via API
3. Wait for 45 seconds of the next minute
4. Check logs for processing
5. Verify bet status updated
6. Check user balance updated (if win)

### Check Cron Status
```bash
curl http://localhost:4000/health
```

## Troubleshooting

### Cron Not Running
- Check server logs for "Color betting cron job started"
- Verify `node-cron` and `moment-timezone` are installed
- Check timezone configuration

### Bets Not Processing
- Verify bets have status `pending`
- Check roundNumber matches current round
- Review logs for errors
- Ensure database connection is active

### Incorrect Payouts
- Verify multipliers in code
- Check user balance before/after
- Review bet amount and winning color
- Check logs for calculation details

## Dependencies

```json
{
  "node-cron": "^3.0.3",
  "moment-timezone": "^0.5.43"
}
```

## File Structure

```
src/
├── cronJobs/
│   ├── colorBettingCron.js       # Main cron job logic
│   └── README.md                 # This file
├── modal/
│   └── roundResultModal.js       # Round result schema
├── db/
│   └── roundResult/
│       └── roundResult.db.processor.js  # DB operations
├── service/
│   └── roundResultService.js     # Business logic
├── controller/
│   └── roundResult/              # API controllers
└── routes/
    └── roundResultRoutes.js      # API routes
```

## Future Enhancements

- [ ] Add WebSocket support for real-time updates
- [ ] Implement bet limits per user/round
- [ ] Add statistics and analytics
- [ ] Support for multiple game modes
- [ ] Admin panel for cron management
- [ ] Betting history export
- [ ] Fraud detection algorithms
