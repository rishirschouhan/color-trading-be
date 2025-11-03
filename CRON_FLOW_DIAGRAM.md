# Color Trading Cron Job - Flow Diagram

## 📊 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER STARTUP                          │
│                                                                 │
│  1. Load environment variables (.env)                          │
│  2. Connect to MongoDB database                                │
│  3. Initialize Express app                                     │
│  4. Initialize ColorBettingCron                                │
│  5. Start cron job (executes at 45 seconds every minute)      │
│  6. Start Express server on port 4000                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      USER PLACES BET                            │
│                                                                 │
│  POST /bet/updateColorHistory                                  │
│  {                                                             │
│    userId: "user123",                                          │
│    roundNumber: 870,  ← Current round (14:30)                 │
│    color: "red",                                               │
│    amount: 100,                                                │
│    status: "pending"  ← Important!                            │
│  }                                                             │
│                                                                 │
│  ✅ Deducts 100 from user's creditCoins                        │
│  ✅ Saves bet with status "pending"                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WAITING FOR 45 SECONDS                       │
│                                                                 │
│  User can place multiple bets until 45 seconds                 │
│  All bets have status: "pending"                               │
│  Betting closes at 45 seconds                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              CRON TRIGGERS AT 45 SECONDS (14:30:45)             │
│                                                                 │
│  colorBettingCron.processBettingRound()                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: COLLECT BETS                         │
│                                                                 │
│  Query: Find all bets where:                                   │
│    - roundNumber = 870                                         │
│    - status = "pending"                                        │
│                                                                 │
│  Found: 5 bets                                                 │
│    - User A: red, 100                                          │
│    - User B: green, 200                                        │
│    - User C: red, 150                                          │
│    - User D: black, 50                                         │
│    - User E: green, 100                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                STEP 2: GENERATE WINNING COLOR                   │
│                                                                 │
│  generateWinningColor()                                        │
│    Random number: 0-100                                        │
│    - 0-45:  Red (45%)                                          │
│    - 45-90: Green (45%)                                        │
│    - 90-100: Black (10%)                                       │
│                                                                 │
│  Result: "red" 🔴                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 3: PROCESS EACH BET                       │
│                                                                 │
│  For each bet:                                                 │
│                                                                 │
│  User A: red, 100                                              │
│    ✅ WIN! (color matches)                                     │
│    Payout: 100 × 2 = 200                                       │
│    Update status: "win"                                        │
│    Add 200 to User A's creditCoins                            │
│                                                                 │
│  User B: green, 200                                            │
│    ❌ LOSE (color doesn't match)                               │
│    Payout: 0                                                   │
│    Update status: "lose"                                       │
│    No balance change (already deducted)                        │
│                                                                 │
│  User C: red, 150                                              │
│    ✅ WIN!                                                      │
│    Payout: 150 × 2 = 300                                       │
│    Update status: "win"                                        │
│    Add 300 to User C's creditCoins                            │
│                                                                 │
│  User D: black, 50                                             │
│    ❌ LOSE                                                      │
│    Payout: 0                                                   │
│    Update status: "lose"                                       │
│                                                                 │
│  User E: green, 100                                            │
│    ❌ LOSE                                                      │
│    Payout: 0                                                   │
│    Update status: "lose"                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 STEP 4: SAVE ROUND RESULT                       │
│                                                                 │
│  Create RoundResult document:                                  │
│  {                                                             │
│    roundNumber: 870,                                           │
│    winningColor: "red",                                        │
│    timestamp: "2024-11-03T14:30:45.000Z",                     │
│    totalBets: 5,                                               │
│    totalAmount: 600,                                           │
│    winnersCount: 2,                                            │
│    totalPayout: 500                                            │
│  }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PROCESSING COMPLETE                        │
│                                                                 │
│  ✅ All bets updated                                           │
│  ✅ Winners credited                                           │
│  ✅ Round result saved                                         │
│  ✅ Logs generated                                             │
│                                                                 │
│  Next execution: 14:31:45 (next minute at 45 seconds)         │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Continuous Cycle

```
14:30:00 - 14:30:44  →  Users place bets (status: pending)
14:30:45             →  Cron processes round 870
14:30:46 - 14:31:44  →  Users place bets for round 871
14:31:45             →  Cron processes round 871
14:31:46 - 14:32:44  →  Users place bets for round 872
14:32:45             →  Cron processes round 872
...and so on
```

## 📊 Database Changes

### Before Cron Execution (14:30:44)

**UserColorBetHistory Collection:**
```javascript
{
  userId: "user123",
  colorBetHistory: [
    {
      _id: "bet001",
      roundNumber: 870,
      color: "red",
      amount: 100,
      status: "pending",  ← Waiting for processing
      timestamp: "2024-11-03T14:30:20.000Z"
    }
  ]
}
```

**User Collection:**
```javascript
{
  _id: "user123",
  name: "John Doe",
  creditCoins: 1000  ← Before bet processing
}
```

### After Cron Execution (14:30:46)

**UserColorBetHistory Collection:**
```javascript
{
  userId: "user123",
  colorBetHistory: [
    {
      _id: "bet001",
      roundNumber: 870,
      color: "red",
      amount: 100,
      status: "win",  ← Updated by cron
      timestamp: "2024-11-03T14:30:20.000Z"
    }
  ]
}
```

**User Collection:**
```javascript
{
  _id: "user123",
  name: "John Doe",
  creditCoins: 1100  ← +200 payout, -100 bet = +100 net
}
```

**RoundResult Collection (NEW):**
```javascript
{
  _id: "round870",
  roundNumber: 870,
  winningColor: "red",
  timestamp: "2024-11-03T14:30:45.000Z",
  totalBets: 5,
  totalAmount: 600,
  winnersCount: 2,
  totalPayout: 500
}
```

## 🎯 Key Points

1. **Betting Window**: 0-44 seconds of each minute
2. **Processing Time**: 45 seconds (betting closes)
3. **Round Number**: Based on time (hour × 60 + minute)
4. **Status Flow**: `pending` → `win` or `lose`
5. **Balance Update**: Only winners get credited (losers already deducted)

## 🔐 Safety Features

- **Concurrent Processing Prevention**: `isProcessing` flag prevents overlapping
- **Graceful Shutdown**: Completes current processing before stopping
- **Error Handling**: Individual bet failures don't stop entire round
- **Transaction Logging**: Every action is logged for audit

## 📈 Monitoring Points

```javascript
// Check cron status
GET /health

// Get current round info
GET /round/current

// Get latest results
GET /round/latest

// Get specific round
GET /round/870
```

## 🎲 Probability Distribution

```
Red:   ████████████████████████████████████████████ 45%
Green: ████████████████████████████████████████████ 45%
Black: ██████████                                   10%
```

## 💰 Payout Examples

| Bet Color | Bet Amount | Winning Color | Result | Payout | Net Profit |
|-----------|------------|---------------|--------|--------|------------|
| Red       | 100        | Red           | WIN    | 200    | +100       |
| Green     | 100        | Red           | LOSE   | 0      | -100       |
| Black     | 100        | Black         | WIN    | 1000   | +900       |
| Red       | 100        | Black         | LOSE   | 0      | -100       |

---

**This diagram shows the complete flow from bet placement to result processing!**
