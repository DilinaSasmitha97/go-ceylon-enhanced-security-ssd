const express = require('express');
const router = express.Router();
const rfidController = require('../controllers/RfidControllers');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new RFID entry
router.post('/', authMiddleware(['admin']), rfidController.createRfid);

// Update an RFID entry
router.put('/:id', authMiddleware(['admin']), rfidController.updateRfid);

// Delete an RFID entry
router.delete('/:id', authMiddleware(['admin']), rfidController.deleteRfid);

// Get all RFID entries
router.get('/', rfidController.getAllRfids);

// Get a single RFID entry by ID
router.get('/:id', rfidController.getRfidById);

module.exports = router;
