const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/BookingControllers');

// Fetch all bookings
router.get('/', bookingController.getAllBookings);

// Create a new booking
router.post('/', bookingController.createBooking);

// Update an existing booking by ID
router.put('/update/:id', bookingController.updateBooking);

// Delete a booking by ID
router.delete('/delete/:id', bookingController.deleteBooking);

// Fetch a booking by its booking ID
router.get('/:bookingId', bookingController.getBookingById);

// Fetch a booking by its user ID
router.get('/user/:userId', bookingController.getBookingsByUser);

// Download receipt for a booking
router.get('/receipt/:bookingId', bookingController.downloadReceipt);

module.exports = router;