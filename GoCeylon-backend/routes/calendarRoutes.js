const express = require('express');
const {
    initiateCalendarAuth,
    handleCalendarCallback
} = require('../controllers/calendarController');

const router = express.Router();

// Incremental-authorization "Add booking to Google Calendar" feature.
router.get('/google', initiateCalendarAuth);
router.get('/callback', handleCalendarCallback);

module.exports = router;
