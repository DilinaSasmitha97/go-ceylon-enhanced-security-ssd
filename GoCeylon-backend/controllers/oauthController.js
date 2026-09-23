const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Tourist = require('../models/UserModel');

// Initialize Google OAuth2 Client
const getOAuth2Client = () => {
    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
    );
};

// In-Memory cache for 60-second One-Time Codes (OTC)
// Single-use guarantee: destroyed immediately upon first exchange
const otcStore = new Map();

/**
 * 1. Initiate Google OAuth Flow
 * GET /api/auth/google
 * Generates cryptographic state (CSRF), nonce (replay protection), and PKCE challenge.
 */
exports.initiateGoogleAuth = (req, res) => {
    try {
        const oauth2Client = getOAuth2Client();

        // 1. Generate CSRF State Token (32 bytes hex)
        const state = crypto.randomBytes(32).toString('hex');

        // 2. Generate Nonce for ID token replay protection (16 bytes hex)
        const nonce = crypto.randomBytes(16).toString('hex');

        // 3. Generate PKCE: code_verifier & code_challenge
        // RFC 7636: code_verifier is a high-entropy cryptographic random string
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');

        // Store session metadata securely in an HttpOnly cookie (10-minute validity)
        const sessionPayload = JSON.stringify({ state, nonce, codeVerifier });
        res.cookie('oauth_session', sessionPayload, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000 // 10 minutes
        });

        // Generate Google Authorization URL
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['openid', 'email', 'profile'],
            state,
            nonce,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            prompt: 'consent'
        });

        // Redirect user to Google sign-in
        res.redirect(authUrl);
    } catch (error) {
        console.error("OAuth Initiation Error:", error);
        res.status(500).json({ message: "Failed to initiate Google authentication", error: error.message });
    }
};

/**
 * 2. Handle Google OAuth Callback
 * GET /api/auth/google/callback
 * Validates state, PKCE verifier, Google signature, and issues a 60s One-Time Code.
 */
exports.handleGoogleCallback = async (req, res) => {
    const { code, state, error: googleError } = req.query;

    if (googleError) {
        return res.status(400).json({ message: "Google authentication denied by user", error: googleError });
    }

    if (!code || !state) {
        return res.status(400).json({ message: "Missing required authorization code or state parameter" });
    }

    // Retrieve stored OAuth session from cookie
    const rawSession = req.cookies.oauth_session;
    if (!rawSession) {
        return res.status(403).json({ message: "OAuth session expired or cookies disabled. Please try again." });
    }

    let session;
    try {
        session = JSON.parse(rawSession);
    } catch (e) {
        return res.status(400).json({ message: "Malformed OAuth session cookie" });
    }

    // 1. Strict State Verification (Anti-CSRF Protection)
    if (session.state !== state) {
        return res.status(403).json({ message: "State mismatch detected! Potential CSRF attack prevented." });
    }

    try {
        const oauth2Client = getOAuth2Client();

        // 2. Exchange authorization code for tokens using PKCE code_verifier
        const { tokens } = await oauth2Client.getToken({
            code,
            codeVerifier: session.codeVerifier
        });

        if (!tokens.id_token) {
            return res.status(400).json({ message: "Google did not return an OpenID Connect ID Token." });
        }

        // 3. Cryptographically verify Google ID Token signature and audience
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        // 4. Strict email_verified Check
        if (!payload.email_verified) {
            return res.status(403).json({ message: "Google email address is not verified. Access denied." });
        }

        // 5. Nonce Verification (Replay Attack Protection)
        if (payload.nonce && session.nonce && payload.nonce !== session.nonce) {
            return res.status(403).json({ message: "Nonce mismatch detected! Potential token replay attack prevented." });
        }

        // 6. Find or Create Tourist Account in MongoDB
        let user = await Tourist.findOne({ email: payload.email });
        if (!user) {
            // New user: register as Tourist automatically
            user = new Tourist({
                name: payload.name || "Google Traveler",
                email: payload.email,
                password: crypto.randomBytes(32).toString('hex'), // Unusable password for OAuth-only user
                destination: 'Beach',
                traveling_with: 'Solo',
                accommodations: true,
                tour_guide: false
            });
            await user.save();
        }

        // 7. Security: Issue a 60-second One-Time Code (OTC) instead of leaking the JWT in URL query params
        const oneTimeCode = crypto.randomBytes(32).toString('hex');
        otcStore.set(oneTimeCode, {
            userId: user._id,
            email: user.email,
            userType: 'tourist',
            createdAt: Date.now()
        });

        // Set 60-second auto-expiration for cleanup
        setTimeout(() => {
            otcStore.delete(oneTimeCode);
        }, 60 * 1000);

        // Clear the OAuth session cookie
        res.clearCookie('oauth_session');

        // 8. Redirect frontend with one-time exchange code
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?code=${oneTimeCode}`);

    } catch (error) {
        console.error("Google Callback Error:", error);
        res.status(500).json({ message: "Authentication failed during token verification", error: error.message });
    }
};

/**
 * 3. Exchange One-Time Code for Session JWT
 * POST /api/auth/oauth/exchange
 * Single-use guarantee: deletes code immediately upon exchange.
 */
exports.exchangeOneTimeCode = (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: "One-time authorization code is required." });
    }

    const sessionData = otcStore.get(code);

    if (!sessionData) {
        return res.status(400).json({ message: "Invalid or expired one-time code." });
    }

    // Check 60-second TTL
    if (Date.now() - sessionData.createdAt > 60 * 1000) {
        otcStore.delete(code);
        return res.status(400).json({ message: "One-time code has expired. Please log in again." });
    }

    // Single-use enforcement: Destroy immediately!
    otcStore.delete(code);

    // Sign official GoCeylon JWT using secure secret from .env
    const token = jwt.sign(
        { id: sessionData.userId, email: sessionData.email, userType: sessionData.userType },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.status(200).json({
        message: "OAuth exchange successful",
        token,
        user: {
            id: sessionData.userId,
            email: sessionData.email,
            userType: sessionData.userType
        }
    });
};
