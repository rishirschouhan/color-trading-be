const userHistoryCntrl = require("./getuserhistoryController")
const updateColorHistoryCntrl = require("./updateColorHistoryController")
const updateMiningGameCntrl = require("./updateMiningGameController")
const updateStairGameCntrl = require("./updateStairGameController")
const updateLudoGameCntrl = require("./updateLudoGameController")

module.exports = {
    userHistory: userHistoryCntrl,
    updateColorHistory: updateColorHistoryCntrl,
    updateMiningGame: updateMiningGameCntrl,
    updateStairGame: updateStairGameCntrl,
    updateLudoGame: updateLudoGameCntrl
}