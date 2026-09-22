const Business = require('../models/BusinessModel');
const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure 'uploads' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Multer configuration
const upload = multer({ storage: storage }).fields([
    { name: 'ownerPhoto', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);

// Create Business
const createBusiness = async (req, res) => {
    try {
        console.log("Request body:", req.body); // Debugging log
        console.log("Files uploaded:", req.files); // Debugging log

        const { user_id, business_name, business_category, contact_number, address, description, openingHours } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const ownerPhoto = req.files?.ownerPhoto ? req.files.ownerPhoto[0].path : "";
        const images = req.files?.images ? req.files.images.map(file => file.path) : [];

        const business = new Business({
            business_user: user_id,
            business_name,
            business_category,
            contact_number,
            address,
            description,
            ownerPhoto,
            images,
            openingHours
        });

        await business.save();
        res.status(201).json({ message: "Business created successfully", business });
    } catch (error) {
        console.error("Error:", error.message); // Debugging log
        res.status(500).json({ error: error.message });
    }
};

// Get All Businesses
const getAllBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find().populate("business_user", "name email");
        res.status(200).json(businesses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Business by ID
const getBusinessById = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id).populate("business_user", "name email");
        if (!business) return res.status(404).json({ message: "Business not found" });
        res.status(200).json(business);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Business
const updateBusiness = async (req, res) => {
    try {
        const updates = req.body;
        if (req.files) {
            if (req.files["ownerPhoto"]) updates.ownerPhoto = req.files["ownerPhoto"][0].path;
            if (req.files["images"]) updates.images = req.files["images"].map(file => file.path);
        }

        const business = await Business.findByIdAndUpdate(req.params.businessId, updates, { new: true });
        if (!business) return res.status(404).json({ message: "Business not found" });
        res.status(200).json({ message: "Business updated successfully", business });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Business
const deleteBusiness = async (req, res) => {
    try {
        const business = await Business.findByIdAndDelete(req.params.id);
        if (!business) return res.status(404).json({ message: "Business not found" });
        res.status(200).json({ message: "Business deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { upload, createBusiness, getAllBusinesses, getBusinessById, updateBusiness, deleteBusiness };