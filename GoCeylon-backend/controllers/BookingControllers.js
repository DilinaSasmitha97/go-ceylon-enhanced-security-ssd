
const path = require('path'); // Import path module to handle file paths

const Booking = require('../models/BookingModel');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer'); // Import Nodemailer
const Tourist = require('../models/UserModel'); // Import Tourist model
const Guide = require('../models/GuideModel');

// Fetch a booking by its ID
exports.getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;  // Fetch bookingId from URL parameters

        // Find booking by bookingId
        const booking = await Booking.findById(bookingId).populate('b_guide', 'g_name');  // Populate guide details

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        return res.status(200).json({ booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Handle PDF receipt download (assuming receipt is generated or stored at a specific path)
exports.downloadReceipt = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Assuming your receipts are stored in a folder named 'receipts'
        const receiptPath = path.join(__dirname, `../receipts/receipt_${bookingId}.pdf`);

        // Check if the file exists
        if (!fs.existsSync(receiptPath)) {
            return res.status(404).json({ message: "Receipt not found" });
        }

        // Send the file as response to be downloaded
        res.download(receiptPath, (err) => {
            if (err) {
                return res.status(500).json({ message: "Error downloading receipt", error: err.message });
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Error downloading receipt", error: err.message });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found" });
        }
        return res.status(200).json({ bookings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || "dewhimu35@gmail.com", // Your email
        pass: process.env.EMAIL_PASS || "xxld kglo aajj dptw" // Your email password
    }
});

// Function to send email
const sendBookingEmail = async (recipient, subject, message) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipient,
            subject: subject,
            text: message
        });
        console.log(`Email sent to ${recipient}`);
    } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error);
    }
};

// Create Booking and Send Email
exports.createBooking = async (req, res) => {
    try {
        const { b_date, b_time, b_location, b_user, b_guide, price, status } = req.body;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(b_user) || !mongoose.Types.ObjectId.isValid(b_guide)) {
            return res.status(400).json({ message: 'Invalid user or guide ID' });
        }

        // Fetch user and guide details
        const user = await Tourist.findById(b_user);
        const guide = await Guide.findById(b_guide);

        if (!user || !guide) {
            return res.status(404).json({ message: 'User or Guide not found' });
        }

        // Create new booking
        const newBooking = new Booking({
            b_date,
            b_time,
            b_location,
            b_user,
            b_guide,
            price,
            status: status || 'pending',
        });

        await newBooking.save();

        // Email content
        const userMessage = `Dear ${user.name},\n\nYour booking is confirmed with guide ${guide.g_name} on ${b_date} at ${b_time}.\nLocation: ${b_location}\nPrice: $${price}\n\nThank you for using our service!`;
        const guideMessage = `Dear ${guide.g_name},\n\nA new booking has been assigned to you by ${user.name} on ${b_date} at ${b_time}.\nLocation: ${b_location}\nPrice: $${price}\n\nPlease be prepared!`;

        // Send emails
        await sendBookingEmail(user.email, "Booking Confirmation", userMessage);
        await sendBookingEmail(guide.email, "New Booking Assigned", guideMessage);

        res.status(201).json({
            message: 'Booking created successfully, emails sent!',
            booking: newBooking,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

// Update an existing booking
exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        delete updatedData.b_id;

        const updatedBooking = await Booking.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
    } catch (error) {
        return res.status(500).json({ message: "Error updating booking", error: error.message });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {

        const { id } = req.params;
        const deletedBooking = await Booking.findByIdAndDelete(id);

        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        return res.status(200).json({ message: "Booking deleted successfully", booking: deletedBooking });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting booking", error: error.message });
    }
};

exports.getBookingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;  // Fetch the userId from the URL parameter

        // Find all bookings related to this user
        const bookings = await Booking.find({ b_user: userId }).populate('b_guide', 'g_name'); // Populate guide details like name

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found for this user" });
        }

        return res.status(200).json({ bookings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const PDFDocument = require('pdfkit');

// Controller function to generate and send a PDF receipt
exports.downloadReceipt = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        // Fetch booking details from the database
        const booking = await Booking.findById(bookingId).populate('b_guide', 'g_name');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Create a PDF document
        const doc = new PDFDocument();

        // Set headers for downloading PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt_${bookingId}.pdf`);

        // Pipe the document to the response
        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(25).text('Booking Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(`Booking ID: ${booking._id}`);
        doc.text(`Guide Name: ${booking.b_guide.g_name}`);
        doc.text(`Date: ${booking.b_date}`);
        doc.text(`Duration (hours): ${booking.b_time}`);
        doc.text(`Location: ${booking.b_location}`);
        doc.text(`Price: $${booking.price}`);
        doc.text(`Status: ${booking.status}`);

        // Finalize the PDF and send it to the client
        doc.end();
    } catch (error) {
        console.error('Error generating receipt:', error);
        res.status(500).json({ message: 'Error generating receipt' });
    }
};
