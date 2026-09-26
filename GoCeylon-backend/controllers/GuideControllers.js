const Guide = require('../models/GuideModel');
const { publicError } = require('../utils/errorResponse');
const bcrypt = require('bcrypt'); // For password hashing
const mongoose = require('mongoose');

// Read
const getAllGuides = async (req, res) => {
    try {
        const guides = await Guide.find();
        if (!guides || guides.length === 0) {
            return res.status(404).json({ message: "No guides found" });
        }
        return res.status(200).json({ guides });
    } catch (err) {
        return res.status(500).json({ message: publicError(err, 'An internal server error occurred') });
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
        res.status(500).json({ message: 'Error fetching guides by location', error: publicError(error, 'Error fetching guides by location') });
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
        res.status(400).json({ message: 'Error creating guide', error: publicError(error, 'Error creating guide') });
    }
};
exports.createGuide = createGuide;

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
        res.status(400).json({ message: 'Error updating guide', error: publicError(error, 'Error updating guide') });
    }
};
exports.updateGuide = updateGuide;

// Delete a guide
const deleteGuide = async (req, res) => {
    try {
        const deletedGuide = await Guide.findByIdAndDelete(req.params.id);
        if (!deletedGuide) return res.status(404).json({ message: 'Guide not found' });
        res.status(200).json({ message: 'Guide deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting guide', error: publicError(error, 'Error deleting guide') });
    }
};
exports.deleteGuide = deleteGuide;
