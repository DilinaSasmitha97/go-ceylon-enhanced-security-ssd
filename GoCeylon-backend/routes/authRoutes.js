const express = require('express');
const rateLimit = require('express-rate-limit');
const { login } = require('../controllers/authController');
const {
    initiateGoogleAuth,
    handleGoogleCallback,
    exchangeOneTimeCode
} = require('../controllers/oauthController');

const router = express.Router();

// VULN-06 (Brute-Force Login) fix:
// Limit each IP to 5 failed login attempts per 15 minutes. Once the limit is
// hit the endpoint responds with HTTP 429, stopping automated password-guessing
// tools (Hydra, ZAP Fuzzer) from trying thousands of passwords unimpeded.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                    // allow 5 attempts per window per IP
    standardHeaders: true,     // send RateLimit-* headers so clients see the limit
    legacyHeaders: false,
    skipSuccessfulRequests: true, // only count failed logins toward the limit
    message: { message: "Too many login attempts. Please try again later." }
});

// Local Email/Password Login route (rate-limited)
router.post('/login', loginLimiter, login);

// Google OAuth 2.0 / OIDC Routes
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.post('/oauth/exchange', exchangeOneTimeCode);

module.exports = router;
