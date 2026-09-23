const mongoose = require('mongoose');
const Booking = require('../models/BookingModel');

// Object-level authorization (VULN-03). Must run after authMiddleware, which sets req.user.

const isAdmin = (user) => user.userType === 'admin';

// Allows the request only when the id in the URL is the caller's own id, or the caller is an admin.
const requireSelfOrAdmin = (paramName) => (req, res, next) => {
    if (isAdmin(req.user) || String(req.user.id) === String(req.params[paramName])) {
        return next();
    }
    return res.status(403).json({ message: "Forbidden. You can only access your own account." });
};

// Loads the booking named in the URL and allows its tourist, its assigned guide (unless
// allowGuide is false) or an admin. The loaded booking is attached as req.booking.
const requireBookingAccess = (paramName, { allowGuide = true } = {}) => async (req, res, next) => {
    const bookingId = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(404).json({ message: "Booking not found" });
    }

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const userId = String(req.user.id);
        const isOwner = req.user.userType === 'tourist' && String(booking.b_user) === userId;
        const isAssignedGuide = allowGuide && req.user.userType === 'guide' && String(booking.b_guide) === userId;

        if (!isAdmin(req.user) && !isOwner && !isAssignedGuide) {
            return res.status(403).json({ message: "Forbidden. You do not have access to this booking." });
        }

        req.booking = booking;
        next();
    } catch (err) {
        console.error("Booking access check failed:", err);
        return res.status(500).json({ message: "Error checking booking access" });
    }
};

module.exports = { requireSelfOrAdmin, requireBookingAccess };
