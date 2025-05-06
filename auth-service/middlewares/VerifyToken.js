const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.headers.token;
    if (token) {
        const accessToken = token.split(" ")[1];
        jwt.verify(accessToken, process.env.JWT_SECRET, (error, user) => {
            if (error) {
                res.status(403).json("Token is not valid");
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json("You're not authenticated");
    }
}

exports.verifyTokenOnlyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.parms.id || req.user.role === "admin") {
            next();
        } else {
            res.status(403).json("You're not allowed to delete other");
        }
    });
}
