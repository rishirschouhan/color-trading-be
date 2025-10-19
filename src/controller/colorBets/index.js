const userHistoryCntrl = require("./getuserhistoryController")
const updateUserHistoryCntrl = require("./updateUserHistoryController")


module.exports = {
    userHistory: userHistoryCntrl,
    updateUserHistory: updateUserHistoryCntrl
}