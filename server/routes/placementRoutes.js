const express = require('express');
const router = express.Router();
const { getCompanies, getCompany, createCompany, updateCompany, applyForDrive, deleteCompany } = require('../controllers/placementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadCompanyLogo } = require('../utils/cloudinary');

router.get('/companies', getCompanies);
router.get('/companies/:id', getCompany);
router.post('/companies', protect, authorize('placement_officer', 'admin'), uploadCompanyLogo.single('logo'), createCompany);
router.put('/companies/:id', protect, authorize('placement_officer', 'admin'), uploadCompanyLogo.single('logo'), updateCompany);
router.post('/companies/:id/apply', protect, authorize('student'), applyForDrive);
router.delete('/companies/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;
