const express = require('express');
const router = express.Router();
const multer = require('multer'); // Multer for file uploads
const path = require('path');
const locationController = require('../controllers/LocationControllers');

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure the "uploads" folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Use multer for handling image uploads
router.post("/", upload.array("images", 5), locationController.createLocation); //

// Routes
router.get('/report', locationController.getAttractionReport); ``
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);




// DELETE: Delete location by ID
router.delete('/:id', locationController.deleteLocation);

// PUT: Update location by ID, allowing image uploads
router.put('/:id', upload.array('images', 5), locationController.updateLocation);

module.exports = router;
