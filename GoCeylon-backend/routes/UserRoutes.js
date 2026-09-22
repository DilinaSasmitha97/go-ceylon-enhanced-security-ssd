const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserControllers');
const authMiddleware = require('../middleware/authMiddleware');

// Define CRUD routes
router.get('/', authMiddleware(['tourist']), UserController.getAllUsers);       // Get all users
router.post('/', UserController.createUser);       // Create a new user
router.put('/:id', authMiddleware(['tourist']), UserController.updateUser);     // Update a user by ID
router.delete('/:id', authMiddleware(['tourist']), UserController.deleteUser);  // Delete a user by ID
router.get('/:id', UserController.getUserById);  // Get user by ID

module.exports = router;


