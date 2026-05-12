const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/create-order', protect, authorize('student'), createOrder);
router.post('/verify', protect, authorize('student'), verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
