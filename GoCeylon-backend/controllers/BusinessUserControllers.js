const BusinessUser = require('../models/BusinessUserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all business users
const getAllBusinessUsers = async (req, res) => {
    try {
        const users = await BusinessUser.find();
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No business users found" });
        }
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get a single business user by ID
const getBusinessUserById = async (req, res) => {
    try {
        const user = await BusinessUser.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Business user not found" });
        }
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Create a new business user
const createBusinessUser = async (req, res) => {
    const { name, email, password, business_name, business_category, dob, contact_number, address } = req.body;

    if (!name || !email || !password || !business_name || !business_category || !dob || !contact_number || !address) {
        return res.status(400).json({ message: "Please provide all required fields." });
    }

    try {
        const newUser = new BusinessUser({
            name,
            email,
            password,
            business_name,
            business_category,
            dob,
            contact_number,
            address
        });

        const createdUser = await newUser.save();
        return res.status(201).json(createdUser);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

// Update business user (only email, contact number, and password)
const updateBusinessUser = async (req, res) => {
    try {
        const { email, contact_number, password } = req.body;
        const user = await BusinessUser.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Business user not found" });
        }

        if (email) user.email = email;
        if (contact_number) user.contact_number = contact_number;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await user.save();
        return res.status(200).json(updatedUser);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

// Delete business user by ID
const deleteBusinessUser = async (req, res) => {
    try {
        const user = await BusinessUser.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Business user not found" });
        }
        return res.status(200).json({ message: "Business user deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Export all controller functions
exports.getAllBusinessUsers = getAllBusinessUsers;
exports.getBusinessUserById = getBusinessUserById;
exports.createBusinessUser = createBusinessUser;
exports.updateBusinessUser = updateBusinessUser;
exports.deleteBusinessUser = deleteBusinessUser;