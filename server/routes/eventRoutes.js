const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getMyEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadEventBanner } = require('../utils/cloudinary');

router.get('/', getEvents);
router.get('/my', protect, authorize('incharge', 'admin'), getMyEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('incharge', 'admin'), uploadEventBanner.single('banner'), createEvent);
router.put('/:id', protect, authorize('incharge', 'admin'), uploadEventBanner.single('banner'), updateEvent);
router.delete('/:id', protect, authorize('incharge', 'admin'), deleteEvent);

module.exports = router;
