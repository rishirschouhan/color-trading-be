require('dotenv').config();
require("../src/connectors/dbConnector")
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('../src/routes/index.js');
const { errorHandler } = require('../src/util/errorHandling');
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
app.use(routes)

app.get('/', (req, res) => { res.status(200).send({ message: "Health Check", code: 200 }) })

app.all('*', (req, res) => {
  res.status(404).send({ code: "Note-Found", message: "Not Found" })
})

app.use(errorHandler);
app.listen(port, async () => {
  console.info(`API is listening on port ${port}`);
});

module.exports = app;

