const express = require('express');
const userRouter = require('./userRoutes');
const colorBetRouter = require('./colorBetRoutes');
const routes = express.Router();

// Public routes
routes.use('/user', userRouter);
routes.use('/color-bet', colorBetRouter);


module.exports = routes;