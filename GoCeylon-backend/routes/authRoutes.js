const express = require('express');
const { login } = require('../controllers/authController');
const {
    initiateGoogleAuth,
    handleGoogleCallback,
    exchangeOneTimeCode
} = require('../controllers/oauthController');

const router = express.Router();

// Local Email/Password Login route
router.post('/login', login);

// Google OAuth 2.0 / OIDC Routes
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.post('/oauth/exchange', exchangeOneTimeCode);

module.exports = router;
