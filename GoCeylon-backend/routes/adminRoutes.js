const express = require('express');
const { registerAdmin } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Only authenticated admins can register new admins
router.post('/register', authMiddleware(['admin']), registerAdmin);


module.exports = router;
