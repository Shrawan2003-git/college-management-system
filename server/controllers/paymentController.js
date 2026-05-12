const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { sendEmail, registrationConfirmationEmail } = require('../utils/sendEmail');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createOrder = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'approved') return res.status(400).json({ success: false, message: 'Event not available for registration' });
    if (event.fee === 0) return res.status(400).json({ success: false, message: 'This is a free event' });

    const now = new Date();
    if (now > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is fully booked' });
    }

    const existing = await Registration.findOne({ event: eventId, participant: req.user._id });
    if (existing && existing.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    const options = {
      amount: event.fee * 100, // in paise
      currency: 'INR',
      receipt: `receipt_${eventId}_${req.user._id}`,
      notes: { eventId, userId: req.user._id.toString(), eventTitle: event.title }
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment record
    await Payment.create({
      user: req.user._id,
      event: eventId,
      razorpayOrderId: order.id,
      amount: event.fee
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      key: process.env.RAZORPAY_KEY_ID,
      event: { title: event.title, venue: event.venue }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify payment & complete registration
// @route   POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, eventId } = req.body;

    // Verify signature using HMAC SHA256
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const event = await Event.findById(eventId);

    // Create registration
    const registration = await Registration.create({
      event: eventId,
      participant: req.user._id,
      paymentStatus: 'paid',
      paymentId: razorpayPaymentId
    });

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
        registration: registration._id
      }
    );

    // Increment participant count
    await Event.findByIdAndUpdate(eventId, { $inc: { currentParticipants: 1 } });

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: `Payment Confirmed – ${event.title}`,
      html: registrationConfirmationEmail(req.user, event, registration.ticketId)
    });

    res.json({
      success: true,
      message: 'Payment verified and registration confirmed!',
      ticketId: registration.ticketId
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payment/history
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id, status: 'paid' })
      .populate('event', 'title date venue')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
