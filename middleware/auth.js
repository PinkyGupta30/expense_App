const jwt = require("jsonwebtoken");

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
            process.env.JWT_SECRET || "secretkey"
        );

        req.user = decodedToken;

        next();

    } catch (error) {
        console.log("Authentication error:", error);

        return res.status(401).json({
            message: "Authentication failed"
        });
    }
};

module.exports = authenticate;