const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllEvents, approveEvent, rejectEvent, getAllUsers, toggleUserStatus, getAllPayments } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/events', getAllEvents);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/payments', getAllPayments);

module.exports = router;
