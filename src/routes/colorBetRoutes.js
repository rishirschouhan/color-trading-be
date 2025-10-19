const express = require('express');
const accessToken = require('../middleware/accesstoken.js');
const colorsBetsCntrl = require('../controller/colorBets/index.js');
const { updateBetHistoryValidator } = require("../validator/updateBetHistoryValidator.js");


const routes = express();

// GET: Fetch last 10 bets for a user
routes.get('/get-bet-history', accessToken, colorsBetsCntrl.userHistory);

// PUT: Update bet history for a user (e.g., add new bet)
routes.put(
  "/update-bet-history",
  accessToken,
  updateBetHistoryValidator,
  colorsBetsCntrl.updateUserHistory
);


module.exports = routes;