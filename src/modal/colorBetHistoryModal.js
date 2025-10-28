const mongoose = require('mongoose');

// Color Bet Schema
const betSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    enum: ['red', 'black', 'green'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10
  },
  status: {
    type: String,
    enum: ['pending', 'win', 'lose'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Mining Game Schema
const miningGameSchema = new mongoose.Schema({
  bet: {
    type: Number,
    required: true,
    min: 1
  },
  mins: {
    type: Number,
    required: true,
    min: 1
  },
  revealed: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['win', 'lose'],
    required: true
  },
  payOut: {
    type: Number,
    required: true,
    min: 10
  },
  multiplier: {
    type: Number,
    required: true,
    min: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Stair Game Schema
const stairGameSchema = new mongoose.Schema({
  bet: {
    type: Number,
    required: true,
    min: 1
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  multiplier: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['win', 'lose'],
    required: true
  },
  payOut: {
    type: Number,
    required: true,
    min: 10
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Ludo Game Schema
const ludoGameSchema = new mongoose.Schema({
  bet: {
    type: Number,
    required: true,
    min: 1
  },
  guess: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  roll: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  status: {
    type: String,
    enum: ['win', 'lose'],
    required: true
  },
  payOut: {
    type: Number,
    required: true,
    min: 10
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Main User Color Bet History Schema
const userColorBetHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  colorBetHistory: {
    type: [betSchema],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },
  miningGamesHistory: {
    type: [miningGameSchema],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },
  stairGamesHistory: {
    type: [stairGameSchema],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },
  ludoGamesHistory: {
    type: [ludoGameSchema],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  }
});

// Custom validator to limit arrays to 10 entries
function arrayLimit(val) {
  return val.length <= 10;
}

module.exports = mongoose.model('UserColorBetHistory', userColorBetHistorySchema);