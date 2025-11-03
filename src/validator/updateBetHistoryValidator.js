const Joi = require("joi");

const updateBetHistoryValidator = (req, res, next) => {
  const { body, params } = req;

  const schema = Joi.object({
    roundNumber: Joi.number().integer().min(1).required(),
    color: Joi.string().valid("red", "black", "green").required(),
    amount: Joi.number().min(10).required(),
    status: Joi.string().valid("pending", "win", "lose").required(),
    payout: Joi.number().min(0).optional(), // Optional, will be set by cron
    timestamp: Joi.date().iso().optional()
  });

  try {
    const { error, value } = schema.validate(body);
    if (error) {
      res.status(400).send({ message: error.message });
      return;
    }

    req.locals = {
      uid: req.locals.value.uid, // assuming :id is userId
      value,
    };

    next();
  } catch (err) {
    console.error("Validator error:", err);
    return res.status(500).send({ message: "Internal server error" });
  }
};

const updateMiningGameValidator = (req, res, next) => {
  const { body, params } = req;

  const schema = Joi.object({
    bet: Joi.number().integer().min(1).required(),
    mins: Joi.number().min(1).required(),
    revealed: Joi.number().min(1).required(),
    status: Joi.string().valid("win", "lose").required(),
    payOut: Joi.number().min(0).required(),
    multiplier: Joi.number().min(1).required(),
    timestamp: Joi.date().iso().optional()
  });

  try {
    const { error, value } = schema.validate(body);
    if (error) {
      res.status(400).send({ message: error.message });
      return;
    }

    req.locals = {
      uid: req.locals.value.uid, // assuming :id is userId
      value,
    };

    next();
  } catch (err) {
    console.error("Validator error:", err);
    return res.status(500).send({ message: "Internal server error" });
  }
};

const updateStairGameValidator = (req, res, next) => {
  const { body, params } = req;

  const schema = Joi.object({
    bet: Joi.number().integer().min(1).required(),
    level: Joi.number().min(1).required(),
    multiplier: Joi.number().min(1).required(),
    status: Joi.string().valid("win", "lose").required(),
    payOut: Joi.number().min(0).required(),
    timestamp: Joi.date().iso().optional()
  });

  try {
    const { error, value } = schema.validate(body);
    if (error) {
      res.status(400).send({ message: error.message });
      return;
    }

    req.locals = {
      uid: req.locals.value.uid, // assuming :id is userId
      value,
    };

    next();
  } catch (err) {
    console.error("Validator error:", err);
    return res.status(500).send({ message: "Internal server error" });
  }
};

const updateLudoGameValidator = (req, res, next) => {
  const { body, params } = req;

  const schema = Joi.object({
    bet: Joi.number().integer().min(1).required(),
    guess: Joi.number().valid(1, 2, 3, 4, 5, 6).required(),
    roll: Joi.number().valid(1, 2, 3, 4, 5, 6).required(),
    status: Joi.string().valid("win", "lose").required(),
    payOut: Joi.number().min(0).required(),
    timestamp: Joi.date().iso().optional()
  });

  try {
    const { error, value } = schema.validate(body);
    if (error) {
      res.status(400).send({ message: error.message });
      return;
    }

    req.locals = {
      uid: req.locals.value.uid, // assuming :id is userId
      value,
    };

    next();
  } catch (err) {
    console.error("Validator error:", err);
    return res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = {
  updateBetHistoryValidator,
  updateMiningGameValidator,
  updateStairGameValidator,
  updateLudoGameValidator
};