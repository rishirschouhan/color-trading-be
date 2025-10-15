const { errorHandler } = require('../util/errorHandling');

const authorize = (roles = []) => {
    // Convert single role to array if needed
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Check if user has required role
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }

            next();
        } catch (error) {
            const { status, message } = errorHandler(error);
            res.status(status).json({ success: false, message });
        }
    };
};

module.exports = authorize;
