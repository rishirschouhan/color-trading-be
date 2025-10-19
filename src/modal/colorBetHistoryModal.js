const mongoose = require('mongoose');

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

const userColorBetHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  bets: {
    type: [betSchema],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  }
});

// Custom validator to limit bets array to 10 entries
function arrayLimit(val) {
  return val.length <= 10;
}

module.exports = mongoose.model('UserColorBetHistory', userColorBetHistorySchema);