const Tourist = require('../models/UserModel'); // Import the correct model

// Get all users (tourists)
const getAllUsers = async (req, res) => {
    try {
        const users = await Tourist.find();
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Read a tourist by ID
const getUserById = async (req, res) => {
    try {
        const user = await Tourist.findById(req.params.id);  // Fetch the user using the provided ID
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);  // Return the user details
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching user details', error: err.message });
    }
};


// Create a new user (tourist)
const createUser = async (req, res) => {
    const { name, email, password, destination, traveling_with, accommodations, tour_guide } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password || !destination || !traveling_with || accommodations === undefined || tour_guide === undefined) {
        return res.status(400).json({ message: "Please provide name, email, password, destination, traveling_with, accommodations, and tour_guide." });
    }

    try {
        // Hash the password before saving

        const newUser = new Tourist({
            name,
            email,
            password,
            destination,
            traveling_with,
            accommodations,
            tour_guide
        });

        const createdUser = await newUser.save();
        return res.status(201).json(createdUser);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

// Update user (tourist) by ID
const updateUser = async (req, res) => {
    try {
        const { name, email, password, destination, traveling_with, accommodations, tour_guide } = req.body;

        // Find the user by ID, including password field
        const user = await Tourist.findById(req.params.id).select('+password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (destination) user.destination = destination;
        if (traveling_with) user.traveling_with = traveling_with;
        if (accommodations !== undefined) user.accommodations = accommodations;
        if (tour_guide !== undefined) user.tour_guide = tour_guide;

        // Hash the new password if it's updated
        if (password) {

        }

        const updatedUser = await user.save();
        return res.status(200).json(updatedUser);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

// Delete user (tourist) by ID
const deleteUser = async (req, res) => {
    try {
        const user = await Tourist.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Export all controller functions
exports.getAllUsers = getAllUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getUserById = getUserById;
