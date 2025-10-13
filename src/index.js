const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const userId = userTokens.get(token);
  if (!userId) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  req.userId = userId;
  next();
};

// In-memory storage (in production, use a database)
let currentSession = null;
let bets = [];
let users = new Map(); // userId -> { id, name, email, cash: number, red: number, green: number, black: number }
let userTokens = new Map(); // token -> userId

// Session management
class SessionManager {
  constructor() {
    this.sessionDuration = 60; // 60 seconds per session
    this.bettingDuration = 45; // 45 seconds for betting
    this.resultDuration = 15; // 15 seconds to show result
  }

  startNewSession() {
    const sessionId = uuidv4();
    const startTime = Date.now();
    const endTime = startTime + (this.sessionDuration * 1000);
    
    currentSession = {
      id: sessionId,
      startTime,
      endTime,
      status: 'active',
      result: null
    };

    // Clear previous bets
    bets = [];

    console.log(`New session started: ${sessionId}`);
    
    // Broadcast new session to all clients
    io.emit('sessionUpdate', {
      currentSession,
      timeRemaining: this.sessionDuration
    });

    // Schedule result generation
    setTimeout(() => {
      this.generateResult();
    }, this.bettingDuration * 1000);

    // Schedule session end
    setTimeout(() => {
      this.endSession();
    }, this.sessionDuration * 1000);
  }

  generateResult() {
    if (!currentSession) return;

    const colors = ['red', 'green', 'black'];
    const result = colors[Math.floor(Math.random() * colors.length)];
    
    currentSession.result = result;
    currentSession.status = 'result';

    console.log(`Session ${currentSession.id} result: ${result}`);

    // Process all pending bets
    bets.forEach(bet => {
      if (bet.result === 'pending') {
        bet.result = bet.color === result ? 'win' : 'lose';
        bet.payout = bet.result === 'win' ? bet.amount * 2 : 0;
        
        // Update user balance
        const user = users.get(bet.userId);
        if (user) {
          if (bet.result === 'win') {
            user.cash += bet.payout;
          }
        }
      }
    });

    // Broadcast result to all clients
    io.emit('sessionUpdate', {
      currentSession,
      timeRemaining: this.resultDuration
    });
  }

  endSession() {
    if (!currentSession) return;

    currentSession.status = 'ended';
    
    console.log(`Session ${currentSession.id} ended`);

    // Broadcast session end
    io.emit('sessionUpdate', {
      currentSession,
      timeRemaining: 0
    });

    // Start new session after a short delay
    setTimeout(() => {
      this.startNewSession();
    }, 2000);
  }

  getCurrentSession() {
    if (!currentSession) {
      this.startNewSession();
    }
    
    const now = Date.now();
    const timeRemaining = Math.max(0, Math.floor((currentSession.endTime - now) / 1000));
    
    return {
      currentSession,
      timeRemaining
    };
  }
}

const sessionManager = new SessionManager();

// Authentication Routes
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    for (let [userId, user] of users) {
      if (user.email === email) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    // Create new user
    const userId = uuidv4();
    const token = uuidv4();
    
    const newUser = {
      id: userId,
      name,
      email,
      cash: 1000, // Starting cash
      red: 0,
      green: 0,
      black: 0
    };

    users.set(userId, newUser);
    userTokens.set(token, userId);

    res.json({
      token,
      user: newUser
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    let foundUser = null;
    for (let [userId, user] of users) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate new token
    const token = uuidv4();
    userTokens.set(token, foundUser.id);

    res.json({
      token,
      user: foundUser
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      userTokens.delete(token);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// API Routes
app.get('/api/session/current', (req, res) => {
  try {
    const sessionData = sessionManager.getCurrentSession();
    res.json(sessionData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get current session' });
  }
});

app.post('/api/bets', authenticateToken, (req, res) => {
  try {
    const { color, amount, sessionId } = req.body;
    const userId = req.userId;

    if (!currentSession || currentSession.id !== sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }

    if (currentSession.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Betting is not active' 
      });
    }

    // Initialize user if not exists
    if (!users.has(userId)) {
      users.set(userId, { cash: 1000, red: 0, green: 0, black: 0 });
    }

    const user = users.get(userId);
    
    if (user.cash < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient funds' 
      });
    }

    // Deduct amount from user's cash
    user.cash -= amount;

    // Create bet
    const bet = {
      id: uuidv4(),
      userId,
      color,
      amount,
      sessionId,
      timestamp: Date.now(),
      result: 'pending'
    };

    bets.push(bet);

    res.json({
      success: true,
      message: 'Bet placed successfully',
      id: bet.id
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to place bet' 
    });
  }
});

app.get('/api/bets/history', authenticateToken, (req, res) => {
  try {
    const userBets = bets.filter(bet => bet.userId === req.userId);
    res.json(userBets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bet history' });
  }
});

app.get('/api/user/balance', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      cash: user.cash,
      red: user.red,
      green: user.green,
      black: user.black
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user balance' });
  }
});

// Server-Sent Events for session updates
app.get('/api/session/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial session data
  const sessionData = sessionManager.getCurrentSession();
  res.write(`data: ${JSON.stringify(sessionData)}\n\n`);

  // Keep connection alive
  const interval = setInterval(() => {
    const sessionData = sessionManager.getCurrentSession();
    res.write(`data: ${JSON.stringify(sessionData)}\n\n`);
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current session data to new client
  const sessionData = sessionManager.getCurrentSession();
  socket.emit('sessionUpdate', sessionData);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the first session
  sessionManager.startNewSession();
});

module.exports = app;
