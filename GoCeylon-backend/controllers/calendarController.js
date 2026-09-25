const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/BookingModel');

/**
 * "Add booking to Google Calendar" using INCREMENTAL AUTHORIZATION.
 *
 * At login the app only asks for `openid email profile`. The Google Calendar
 * permission is a separate, more sensitive scope, so we do NOT request it up
 * front. We request it only here, the first time the user actually chooses to
 * add a booking to their calendar (least privilege). `include_granted_scopes`
 * makes Google ADD the calendar scope to what the user already granted, instead
 * of asking them to re-approve everything.
 *
 * The calendar access token is used immediately to create the event and then
 * discarded — the app never stores Google tokens.
 */

const getOAuth2Client = () =>
    new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_CALLBACK_URL || 'http://localhost:3000/api/calendar/callback'
    );

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

// Turn the booking's stored date/time strings into an event start/end window.
const buildEventTimes = (bDate, bTime) => {
    let start = new Date(`${bDate}T${bTime}`);
    if (isNaN(start)) start = new Date(`${bDate} ${bTime}`);
    if (isNaN(start)) start = new Date(bDate);
    if (isNaN(start)) start = new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2-hour tour window
    return { start: start.toISOString(), end: end.toISOString() };
};

/**
 * GET /api/calendar/google?bookingId=<id>
 * Starts incremental Google consent for the calendar scope.
 */
exports.initiateCalendarAuth = (req, res) => {
    try {
        const { bookingId } = req.query;

        // Validate the booking id is a plain, well-formed ObjectId string
        // (defence-in-depth against operator/injection-style input).
        if (typeof bookingId !== 'string' || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'A valid bookingId is required.' });
        }

        const oauth2Client = getOAuth2Client();

        const state = crypto.randomBytes(32).toString('hex');
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

        // Keep state, PKCE verifier and the target booking server-side only.
        res.cookie('calendar_session', JSON.stringify({ state, codeVerifier, bookingId }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000
        });

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [CALENDAR_SCOPE],
            include_granted_scopes: true, // incremental: add to already-granted login scopes
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            prompt: 'consent'
        });

        res.redirect(authUrl);
    } catch (error) {
        console.error('Calendar auth initiation error:', error);
        res.status(500).json({ message: 'Failed to start Google Calendar authorization' });
    }
};

/**
 * GET /api/calendar/callback
 * Exchanges the code for a calendar access token, creates the event, and
 * redirects the user back to the booking page with a success/error flag.
 */
exports.handleCalendarCallback = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const { code, state, error: googleError } = req.query;

    const rawSession = req.cookies.calendar_session;
    res.clearCookie('calendar_session');

    if (googleError) {
        return res.redirect(`${frontendUrl}/user/calendar-bookings?calendar=denied`);
    }
    if (!code || !state || !rawSession) {
        return res.redirect(`${frontendUrl}/user/calendar-bookings?calendar=error`);
    }

    let session;
    try {
        session = JSON.parse(rawSession);
    } catch (e) {
        return res.redirect(`${frontendUrl}/user/calendar-bookings?calendar=error`);
    }

    // CSRF: the state returned by Google must match the one we stored.
    if (session.state !== state) {
        return res.redirect(`${frontendUrl}/user/calendar-bookings?calendar=error`);
    }

    try {
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken({ code, codeVerifier: session.codeVerifier });

        if (!tokens.access_token) {
            return res.redirect(`${frontendUrl}/user/calendar-bookings?calendar=error`);
        }

        const booking = await Booking.findById(session.bookingId).lean();
        if (!booking) {
            return res.redirect(`${frontendUrl}/user/calendar-bookings?calendar=notfound`);
        }

        const { start, end } = buildEventTimes(booking.b_date, booking.b_time);

        const event = {
            summary: `GoCeylon Tour - ${booking.b_location}`,
            location: booking.b_location,
            description:
                `GoCeylon tour booking\n` +
                `Location: ${booking.b_location}\n` +
                `Time: ${booking.b_time}\n` +
                `Price: LKR ${booking.price}\n` +
                `Status: ${booking.status}`,
            start: { dateTime: start, timeZone: 'Asia/Colombo' },
            end: { dateTime: end, timeZone: 'Asia/Colombo' }
        };

        // Create the event on the consenting user's own primary calendar.
        const apiResp = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            }
        );

        if (!apiResp.ok) {
            const body = await apiResp.text();
            console.error('Google Calendar API error:', apiResp.status, body);
            return res.redirect(`${frontendUrl}/user/calendar-bookings?calendar=error`);
        }

        // Token is intentionally not stored; it is discarded here.
        return res.redirect(`${frontendUrl}/user/calendar-bookings?calendar=success`);
    } catch (error) {
        console.error('Calendar callback error:', error);
        const bookingId = session && session.bookingId ? session.bookingId : '';
        return res.redirect(`${frontendUrl}/user/calendar-bookings?calendar=error`);
    }
};
