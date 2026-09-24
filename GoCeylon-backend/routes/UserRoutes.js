const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { requireSelfOrAdmin } = require('../middleware/ownershipMiddleware');

// Define CRUD routes
router.get('/', authMiddleware(['admin']), UserController.getAllUsers);       // Get all users (admin only)
router.post('/', UserController.createUser);       // Create a new user (public registration)
router.put('/:id', authMiddleware(['tourist', 'admin']), requireSelfOrAdmin('id'), UserController.updateUser);     // Update own account
router.delete('/:id', authMiddleware(['tourist', 'admin']), requireSelfOrAdmin('id'), UserController.deleteUser);  // Delete own account
router.get('/:id', authMiddleware(['tourist', 'admin']), requireSelfOrAdmin('id'), UserController.getUserById);  // Get own profile

module.exports = router;
