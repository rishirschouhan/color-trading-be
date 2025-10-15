const { errorHandler } = require('../util/errorHandling');

const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { 
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }
        
        // Replace req.body with the validated and sanitized values
        req[property] = schema.validate(req[property], {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        }).value;
        
        next();
    };
};

module.exports = validateRequest;
