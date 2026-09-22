const express = require('express');
const router = express.Router();
const GuideController = require('../controllers/GuideControllers');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware(['admin', 'tourist', 'guide']), GuideController.getAllGuides);
router.post('', GuideController.createGuide);
router.put('/update/:id', authMiddleware(['admin', 'guide']), GuideController.updateGuide);
router.delete('/delete/:id', authMiddleware(['admin', 'guide']), GuideController.deleteGuide);
router.get('/location/:id', GuideController.getGuidesByLocation);

module.exports = router;