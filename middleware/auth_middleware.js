const jwt = require('jsonwebtoken');
require('dotenv').config();

const log = (level, message) => console.log(`[${new Date().toISOString()}] [AUTH_MIDDLEWARE] ${level}: ${message}`);

const authenticateToken = (req, res, next) => {
    const auth_header = req.headers['authorization'];

    // to extract the token after 'Bearer' and then a ' '
    const token = auth_header && auth_header.split(' ')[1];

    if (token == null) {
        return res.status(401).json({
            status: 401,
            message: 'Authentication required. Token is absent.'
        });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 403,
                message: 'Invalid or expired authentication token. Kindly login.'
            });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;