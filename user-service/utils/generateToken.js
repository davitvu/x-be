const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    const payload = {
        id: userId,
    };

    const secretKey = process.env.JWT_SECRET;
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN,
    };

    if (!secretKey) {
        throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(payload, secretKey, options);
};

module.exports = generateToken;