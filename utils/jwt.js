const jwt = require('jsonwebtoken');
const config = require('../config')

const secretKey = config.app.jwtSecret;

let expiresIn = '1h';

// Function to create a JWT
function signToken(payload) {
    return jwt.sign(payload, secretKey, { expiresIn });
}


// Middleware function to verify JWT
const verifyToken = (req, res, next) => {
    // Get the token from the request header
    const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Attach the decoded user information to the request for later use
        req.user = decoded;

        // Continue with the request
        next();
    });
};

module.exports = { signToken, verifyToken };
