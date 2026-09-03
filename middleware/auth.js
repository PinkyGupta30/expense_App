const jwt = require("jsonwebtoken");

const logger = require("../utils/logger");

const authenticate = (req, res, next) => {
    try {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }

        const jwtToken = token.replace("Bearer ", "");

        const decodedToken = jwt.verify(
            jwtToken,
            process.env.JWT_SECRET
        );

        req.user = decodedToken;

        next();

    } catch (error) {

        logger.error({
            message: "Authentication error",
            error: error.message,
            stack: error.stack
        });

        return res.status(401).json({
            message: "Authentication failed"
        });
    }
};

module.exports = authenticate;