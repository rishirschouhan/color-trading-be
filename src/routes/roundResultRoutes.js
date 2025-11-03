const express = require('express');
const router = express.Router();
const roundResultController = require('../controller/roundResult');

// Get current round number and time remaining
router.get('/current', roundResultController.getCurrentRound);

// Get latest round results
router.get('/latest', roundResultController.getLatestResults);

// Get specific round result by round number
router.get('/:roundNumber', roundResultController.getRoundResult);

module.exports = router;
