const express = require('express');
const router = express.Router();
const { registerForEvent, getMyRegistrations, getEventRegistrations, markAttendance } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('student'), registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/event/:eventId', protect, authorize('incharge', 'admin'), getEventRegistrations);
router.put('/:id/attendance', protect, authorize('incharge', 'admin'), markAttendance);

module.exports = router;
