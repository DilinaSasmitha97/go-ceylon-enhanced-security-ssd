const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/BookingControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { requireSelfOrAdmin, requireBookingAccess } = require('../middleware/ownershipMiddleware');

// Fetch all bookings (admin only)
router.get('/', authMiddleware(['admin']), bookingController.getAllBookings);

// Create a new booking for the logged-in tourist
router.post('/', authMiddleware(['tourist']), bookingController.createBooking);

// Update an existing booking by ID (owner, assigned guide or admin)
router.put('/update/:id', authMiddleware(['tourist', 'guide', 'admin']), requireBookingAccess('id'), bookingController.updateBooking);

// Delete a booking by ID (owner or admin)
router.delete('/delete/:id', authMiddleware(['tourist', 'admin']), requireBookingAccess('id', { allowGuide: false }), bookingController.deleteBooking);

// Fetch a booking by its booking ID (owner, assigned guide or admin)
router.get('/:bookingId', authMiddleware(['tourist', 'guide', 'admin']), requireBookingAccess('bookingId'), bookingController.getBookingById);

// Fetch the bookings of a user (that user or admin)
router.get('/user/:userId', authMiddleware(['tourist', 'admin']), requireSelfOrAdmin('userId'), bookingController.getBookingsByUser);

// Download receipt for a booking (owner, assigned guide or admin)
router.get('/receipt/:bookingId', authMiddleware(['tourist', 'guide', 'admin']), requireBookingAccess('bookingId'), bookingController.downloadReceipt);

module.exports = router;
