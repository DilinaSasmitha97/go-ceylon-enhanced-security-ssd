const jwt = require('jsonwebtoken');

// Issues a JWT with the same payload shape as authController.login.
const tokenFor = (user, userType) =>
    'Bearer ' + jwt.sign(
        { id: String(user._id), email: user.email, userType },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

module.exports = { tokenFor };
