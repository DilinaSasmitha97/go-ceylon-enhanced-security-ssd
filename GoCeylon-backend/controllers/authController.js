const Tourist = require('../models/UserModel');
const Guide = require('../models/GuideModel');
const BusinessUser = require('../models/BusinessUserModel');
const Admin = require('../models/AdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

// Login function
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // VULN-05 (NoSQL Injection) fix:
        // Reject any credential that is not a plain string. This blocks payloads
        // like { "email": { "$regex": "^admin" } }, where an attacker sends a
        // MongoDB query operator instead of a real email to probe the database.
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        let user = null;
        let userType = '';

        // Check Admin first
        user = await Admin.findOne({ email }).select('+password');
        if (user) {
            userType = 'admin';
            const token = jwt.sign(
                { id: user._id, email: user.email, userType: 'admin' },
                SECRET_KEY,
                { expiresIn: "1d" }
            );
        }

        // Then check other user types
        if (!user) {
            user = await Tourist.findOne({ email }).select('+password');
            if (user) userType = 'tourist';
        }
        if (!user) {
            user = await Guide.findOne({ email }).select('+password');
            if (user) userType = 'guide';
        }
        if (!user) {
            user = await BusinessUser.findOne({ email }).select('+password');
            if (user) userType = 'business_user';
        }

        // VULN-05 (User Enumeration) fix:
        // Use ONE identical message whether the email is unknown or the password
        // is wrong. Different messages let an attacker tell which emails exist.
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, userType },
            SECRET_KEY,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                userType,
            },
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
