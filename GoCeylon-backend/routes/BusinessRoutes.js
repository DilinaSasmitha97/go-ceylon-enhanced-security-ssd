const express = require('express');
const BusinessControllers = require('../controllers/BusinessControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { requireBusinessOwnerOrAdmin } = require('../middleware/ownershipMiddleware');
const { imageFields, uploadRateLimit } = require('../middleware/imageUploadMiddleware');

const router = express.Router();

// Route to create a new business (requires file uploads)
router.post(
    '/create',
    authMiddleware(['business_user', 'admin']),
    uploadRateLimit,
    ...imageFields([
        { name: 'ownerPhoto', maxCount: 1 },
        { name: 'images', maxCount: 5 }
    ]),
    BusinessControllers.createBusiness
);

// Route to get all businesses
router.get('/', BusinessControllers.getAllBusinesses);

// Route to get a single business by ID
router.get('/:id', BusinessControllers.getBusinessById);

// Route to update a business by ID (requires file uploads)
router.put(
    '/:businessId',
    authMiddleware(['business_user', 'admin']),
    requireBusinessOwnerOrAdmin('businessId'),
    uploadRateLimit,
    ...imageFields([
        { name: 'ownerPhoto', maxCount: 1 },
        { name: 'images', maxCount: 5 }
    ]),
    BusinessControllers.updateBusiness
);

// Route to delete a business by ID
router.delete(
    '/:id',
    authMiddleware(['business_user', 'admin']),
    requireBusinessOwnerOrAdmin('id'),
    BusinessControllers.deleteBusiness
);

module.exports = router;
