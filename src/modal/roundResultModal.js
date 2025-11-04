const mongoose = require('mongoose');

// Round Result Schema - stores the winning color for each round
const roundResultSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  winningColor: {
    type: String,
    enum: ['red', 'black', 'green'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  totalBets: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  winnersCount: {
    type: Number,
    default: 0
  },
  totalPayout: {
    type: Number,
    default: 0
  }
}, {
  versionKey: false,
  timestamps: true
});

// Add compound unique index for roundNumber and date
roundResultSchema.index({ roundNumber: 1, date: 1 }, { unique: true });

// Add index for efficient querying
roundResultSchema.index({ timestamp: -1 });

const RoundResult = mongoose.model('RoundResult', roundResultSchema);

module.exports = RoundResult;
