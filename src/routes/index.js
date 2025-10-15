const express = require('express');
const userRouter = require('./userRoutes');
const routes = express.Router();

// Public routes
routes.use('/user', userRouter);


module.exports = routes;