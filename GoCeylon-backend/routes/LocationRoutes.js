const express = require('express');
const router = express.Router();
const locationController = require('../controllers/LocationControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { imageArray, uploadRateLimit } = require('../middleware/imageUploadMiddleware');

// Use multer for handling image uploads
router.post("/", authMiddleware(['admin']), uploadRateLimit, ...imageArray("images", 5), locationController.createLocation);

// Routes
router.get('/report', locationController.getAttractionReport); ``
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);




// DELETE: Delete location by ID
router.delete('/:id', authMiddleware(['admin']), locationController.deleteLocation);

// PUT: Update location by ID, allowing image uploads
router.put('/:id', authMiddleware(['admin']), uploadRateLimit, ...imageArray('images', 5), locationController.updateLocation);

module.exports = router;
