const Guide = require('../models/GuideModel');
const bcrypt = require('bcrypt'); // For password hashing
const multer = require('multer'); // For file uploads
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed (jpeg, jpg, png)'));
        }
    }
});

// Read
const getAllGuides = async (req, res) => {
    try {
        const guides = await Guide.find();
        if (!guides || guides.length === 0) {
            return res.status(404).json({ message: "No guides found" });
        }
        return res.status(200).json({ guides });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.getAllGuides = getAllGuides;

// Get all guides by location ID
const getGuidesByLocation = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("------------" + id + "-----------------");


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid location ID' });
        }

        const guides = await Guide.find({ location: id }).populate('location', 'name');


        if (!guides || guides.length === 0) {
            return res.status(404).json({ message: 'No guides found for the given location' });
        }

        res.status(200).json({ guides });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching guides by location', error: error.message });
    }
};

exports.getGuidesByLocation = getGuidesByLocation;

// Create a new guide with photo upload
const createGuide = async (req, res) => {
    try {
        const newGuide = new Guide({
            ...req.body,
            image: req.file ? req.file.path : undefined // ✅ Save file path in 'image' field
        });
        await newGuide.save();
        res.status(201).json(newGuide);
    } catch (error) {
        res.status(400).json({ message: 'Error creating guide', error: error.message });
    }
};
exports.createGuide = [upload.single('photo'), createGuide];

// Update a Guide
const updateGuide = async (req, res) => {
    try {
        const updatedData = {
            ...req.body
        };

        if (req.file) {
            updatedData.image = req.file.path; // ✅ Update image if uploaded
        }

        const updatedGuide = await Guide.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });
        if (!updatedGuide) return res.status(404).json({ message: 'Guide not found' });
        res.status(200).json(updatedGuide);
    } catch (error) {
        res.status(400).json({ message: 'Error updating guide', error: error.message });
    }
};
exports.updateGuide = [upload.single('photo'), updateGuide];

// Delete a guide
const deleteGuide = async (req, res) => {
    try {
        const deletedGuide = await Guide.findByIdAndDelete(req.params.id);
        if (!deletedGuide) return res.status(404).json({ message: 'Guide not found' });
        res.status(200).json({ message: 'Guide deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting guide', error: error.message });
    }
};
exports.deleteGuide = deleteGuide;
