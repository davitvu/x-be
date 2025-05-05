const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Chi lay msg tu loi dau tien de don gian
        return res.status(400).json({ errors: errors.array().map(e => e.msg) });
        // Hoac tra ve toan bo errors: return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { validateRequest };