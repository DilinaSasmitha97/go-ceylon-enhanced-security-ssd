require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRouter = require("./routes/UserRoutes");
const locationRouter = require("./routes/LocationRoutes");
const bookingRouter = require("./routes/BookingRoutes");
const guideRouter = require("./routes/GuideRoutes");
const rfidRouter = require("./routes/RfidRoutes");
const scanerRouter = require("./routes/scanerRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const businessRouter = require('./routes/BusinessRoutes');
const businessUserRouter = require('./routes/BusinessUserRoutes');
const authMiddleware = require("./middleware/authMiddleware");

// Initialize Express App
const app = express();

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const cookieParser = require('cookie-parser');

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

/* pasees dammme */
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/users", userRouter);
app.use("/location", locationRouter);
app.use("/booking", bookingRouter);
app.use("/guides", guideRouter);
app.use("/rfid", rfidRouter);
app.use("/api/scaner", scanerRouter);
app.use("/api/chat", chatRoutes);
app.use("/admin", adminRoutes);
app.use("/api/business", businessRouter);
app.use("/businessuser", businessUserRouter);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose
    .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");

        // Start Server Only After DB Connection
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err);
        process.exit(1); // Stop process if DB connection fails
    });

// Handle MongoDB Disconnects
mongoose.connection.on("disconnected", () => {
    console.error("MongoDB disconnected! Retrying...");
});

// Global Error Handling
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
});
