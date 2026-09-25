require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
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
const calendarRouter = require("./routes/calendarRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandler");

// Initialize Express App
const app = express();

// Security headers (VULN-08). The API only returns JSON and redirects, so the
// policy can deny everything, including being framed by other sites.
app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: false,
        directives: {
            defaultSrc: ["'none'"],
            baseUri: ["'none'"],
            formAction: ["'none'"],
            frameAncestors: ["'none'"],
        },
    },
    frameguard: { action: 'deny' },
}));
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    next();
});

// Serve static files from the "uploads" directory. The frontend runs on another
// origin and shows these images, so they may be loaded cross-origin.
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// API responses can contain personal data: never store them in browser or proxy caches
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

const cookieParser = require('cookie-parser');

// Middleware
// Allowed frontend origins come from the environment (comma-separated), never hardcoded dev URLs
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use(cors({
    // Unknown origins get no CORS headers (the browser blocks them) instead of an error page
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
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
app.use("/api/calendar", calendarRouter);

// Unknown routes get a JSON 404 instead of Express's default HTML page (A10)
app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

// Central error handler, registered last (A10)
app.use(errorHandler);

module.exports = app;
