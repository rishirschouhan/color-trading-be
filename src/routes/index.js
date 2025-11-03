const express = require('express');
const userRouter = require('./userRoutes');
const colorBetRouter = require('./colorBetRoutes');
const roundResultRouter = require('./roundResultRoutes');
const routes = express.Router();

// Public routes
routes.use('/user', userRouter);
routes.use('/bet', colorBetRouter);
routes.use('/round', roundResultRouter);


module.exports = routes;