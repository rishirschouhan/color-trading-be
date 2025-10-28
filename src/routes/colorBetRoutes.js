const express = require('express');
const accessToken = require('../middleware/accesstoken.js');
const colorsBetsCntrl = require('../controller/colorBets/index.js');
const { updateBetHistoryValidator , updateMiningGameValidator, updateStairGameValidator, updateLudoGameValidator} = require("../validator/updateBetHistoryValidator.js");


const routes = express();

// GET: Fetch all bet history for a user
routes.get('/get-bet-history', accessToken, colorsBetsCntrl.userHistory);

// PUT: Update bet history for a user (e.g., add new bet)
routes.put(
  "/color-history",
  accessToken,
  updateBetHistoryValidator,
  colorsBetsCntrl.updateColorHistory
);

routes.put(
  "/mining-history",
  accessToken,
  updateMiningGameValidator,
  colorsBetsCntrl.updateMiningGame
);

routes.put(
  "/ludo-history",
  accessToken,
  updateLudoGameValidator,
  colorsBetsCntrl.updateLudoGame
);

routes.put(
  "/stair-history",
  accessToken,
  updateStairGameValidator,
  colorsBetsCntrl.updateStairGame
);


module.exports = routes;