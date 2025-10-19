const Joi = require("joi");

const updateBetHistoryValidator = (req, res, next) => {
  const { body, params } = req;

  const schema = Joi.object({
    roundNumber: Joi.number().integer().min(1).required(),
    color: Joi.string().valid("red", "black", "green").required(),
    amount: Joi.number().min(1).required(),
    status: Joi.string().valid("pending", "win", "lose").required(),
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
  updateBetHistoryValidator
};