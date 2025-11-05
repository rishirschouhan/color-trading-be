require('dotenv').config();
require("../src/connectors/dbConnector")
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('../src/routes/index.js');
const { errorHandler } = require('../src/util/errorHandling');
const ColorBettingCron = require('../src/cronJobs/colorBettingCron');
const app = express();

global.ErrorCodes = require('../src/constant/errorCodes')

const port = process.env.PORT || 4000;

// Enable CORS
app.use(cors());

app.use(bodyParser.json())
app.use((req, res, next) => {
  console.dir({ url: req.url }, { depth: null });
  console.dir({ params: req.params }, { depth: null });
  console.dir({ query: req.query }, { depth: null });
  console.dir({ body: req.body }, { depth: null });
  console.dir({ headers: req.headers }, { depth: null });

  next();
})

// Initialize the cron job only if not running on Vercel
// Vercel uses its own cron system via vercel.json
const isVercel = process.env.VERCEL === '1';
const colorBettingCron = new ColorBettingCron(console);

// Start the cron job when server starts (only for local/non-Vercel environments)
if (!isVercel) {
  colorBettingCron.start();
  console.info('Local cron job initialized - will execute at 45 seconds of every minute');
} else {
  console.info('Running on Vercel - cron job will be triggered via Vercel Cron at /api/cron endpoint');
}

app.use(routes)

app.get('/', (req, res) => { res.status(200).send({ message: "Health Check", code: 200 }) })

// Health check endpoint with cron status
app.get('/health', (req, res) => {
  res.status(200).send({
    message: "Health Check",
    code: 200,
    cronStatus: colorBettingCron.getStatus()
  });
})

app.all('*', (req, res) => {
  res.status(404).send({ code: "Note-Found", message: "Not Found" })
})

app.use(errorHandler);

// Graceful shutdown (only for local environments)
if (!isVercel) {
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, stopping cron job...');
    colorBettingCron.stop();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, stopping cron job...');
    colorBettingCron.stop();
    process.exit(0);
  });
}

app.listen(port, async () => {
  console.info(`API is listening on port ${port}`);
  console.info('Color betting cron job is active - executes at 45 seconds of every minute (UTC)');
});

module.exports = app;

