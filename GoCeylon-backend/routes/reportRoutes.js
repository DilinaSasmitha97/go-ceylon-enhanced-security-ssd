const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

const router = express.Router();
const adminOnly = authMiddleware(['admin']);

router.get('/overview', adminOnly, reportController.getOverview);
router.get('/location-categories', adminOnly, reportController.getLocationCategories);
router.get('/gender-diversity', adminOnly, reportController.getGenderDiversity);
router.get('/top-locations', adminOnly, reportController.getTopLocations);

module.exports = router;
