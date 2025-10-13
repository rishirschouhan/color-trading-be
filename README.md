# Color Trading Backend

Backend API for the Color Trading Betting Application.

## Features

- **Session Management**: Automated betting sessions with live timing
- **Real-time Updates**: WebSocket and Server-Sent Events for live session updates
- **Betting System**: Place bets on color predictions with 2x payout
- **User Management**: Track user balances and betting history
- **RESTful API**: Clean API endpoints for all operations

## Session Flow

1. **Active Session (45 seconds)**: Users can place bets on red, green, or black
2. **Result Phase (15 seconds)**: Random color is generated and results are processed
3. **New Session**: Automatically starts a new session after 2-second break

## API Endpoints

### Session Management
- `GET /api/session/current` - Get current session information
- `GET /api/session/stream` - Server-Sent Events stream for live updates

### Betting
- `POST /api/bets` - Place a bet
- `GET /api/bets/history` - Get user's betting history

### User Management
- `GET /api/user/balance` - Get user's current balance

## Installation

```bash
cd color-trading-be
npm install
```

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on port 3001 by default.

## Environment Variables

- `PORT` - Server port (default: 3001)

## Session Configuration

- Session Duration: 60 seconds
- Betting Phase: 45 seconds
- Result Phase: 15 seconds
- Payout: 2x for winning bets

## Real-time Features

- Live session countdown
- Real-time result updates
- WebSocket connections for instant updates
- Server-Sent Events for session streaming
