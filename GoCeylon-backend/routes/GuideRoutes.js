const express = require('express');
const router = express.Router();
const GuideController = require('../controllers/GuideControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { singleImage, uploadRateLimit } = require('../middleware/imageUploadMiddleware');

router.get('/', authMiddleware(['admin', 'tourist', 'guide']), GuideController.getAllGuides);
router.post('', uploadRateLimit, ...singleImage('photo'), GuideController.createGuide);
router.put('/update/:id', authMiddleware(['admin', 'guide']), uploadRateLimit, ...singleImage('photo'), GuideController.updateGuide);
router.delete('/delete/:id', authMiddleware(['admin', 'guide']), GuideController.deleteGuide);
router.get('/location/:id', GuideController.getGuidesByLocation);

module.exports = router;
