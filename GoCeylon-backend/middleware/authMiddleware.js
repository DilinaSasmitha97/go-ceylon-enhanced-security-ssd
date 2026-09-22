const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key"; // Use your secure secret key

module.exports = (allowedUserTypes) => {
    return (req, res, next) => {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        try {
            const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
            req.user = decoded; // Attach user data to request

            console.log("Decoded Token:", decoded); // Log the entire decoded token
            console.log("Allowed User Types:", allowedUserTypes);

            // Check if userType is in the allowed list
            if (!allowedUserTypes.includes(req.user.userType)) {
                return res.status(403).json({ message: "Forbidden. You do not have access to this route." });
            }

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error("Token verification error:", error.message);
            res.status(400).json({ message: "Invalid token" });
        }
    };
};
