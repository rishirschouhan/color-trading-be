require('dotenv').config();
require("../src/connectors/dbConnector");
const ColorBettingCron = require('../src/cronJobs/colorBettingCron');

/**
 * Vercel Cron Handler
 * This endpoint is called by Vercel Cron at the scheduled time
 * Executes the same betting round logic as the local cron
 */
module.exports = async (req, res) => {
  // Verify the request is from Vercel Cron (optional security check)
  const authHeader = req.headers.authorization;
  
  // Only allow POST requests from Vercel Cron
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST or GET requests'
    });
  }

  try {
    console.log('Vercel Cron triggered at:', new Date().toISOString());
    
    // Create a new instance of the cron processor
    const colorBettingCron = new ColorBettingCron(console);
    
    // Execute the betting round processing
    await colorBettingCron.processBettingRound();
    
    return res.status(200).json({
      success: true,
      message: 'Betting round processed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in Vercel cron execution:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to process betting round',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
