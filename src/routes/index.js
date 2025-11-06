const express = require('express');
const userRouter = require('./userRoutes');
const colorBetRouter = require('./colorBetRoutes');
const roundResultRouter = require('./roundResultRoutes');
const transactionRouter = require('./transactionRoutes');
const routes = express.Router();

// Public routes
routes.use('/user', userRouter);
routes.use('/bet', colorBetRouter);
routes.use('/round', roundResultRouter);
routes.use('/transaction', transactionRouter);

module.exports = routes;