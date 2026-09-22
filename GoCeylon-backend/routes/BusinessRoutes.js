const express = require('express');
const BusinessControllers = require('../controllers/BusinessControllers');

const router = express.Router();

// Route to create a new business (requires file uploads)
router.post('/create', BusinessControllers.upload, BusinessControllers.createBusiness);

// Route to get all businesses
router.get('/', BusinessControllers.getAllBusinesses);

// Route to get a single business by ID
router.get('/:id', BusinessControllers.getBusinessById);

// Route to update a business by ID (requires file uploads)
router.put('/:businessId', BusinessControllers.upload, BusinessControllers.updateBusiness);

// Route to delete a business by ID
router.delete('/:id', BusinessControllers.deleteBusiness);

module.exports = router;
