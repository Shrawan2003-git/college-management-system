const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { sendEmail, registrationConfirmationEmail } = require('../utils/sendEmail');

// @desc    Register for event (free events)
// @route   POST /api/registrations
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'approved') return res.status(400).json({ success: false, message: 'Event is not open for registration' });

    const now = new Date();
    if (now > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is fully booked' });
    }

    if (event.fee > 0) {
      return res.status(400).json({ success: false, message: 'This is a paid event. Please use the payment route.' });
    }

    const existing = await Registration.findOne({ event: eventId, participant: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already registered for this event' });

    const registration = await Registration.create({
      event: eventId,
      participant: req.user._id,
      paymentStatus: 'free'
    });

    await Event.findByIdAndUpdate(eventId, { $inc: { currentParticipants: 1 } });

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: `Registration Confirmed – ${event.title}`,
      html: registrationConfirmationEmail(req.user, event, registration.ticketId)
    });

    res.status(201).json({ success: true, registration });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ participant: req.user._id })
      .populate('event', 'title banner date venue fee status category')
      .sort({ createdAt: -1 });
    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get event registrations (for incharge)
// @route   GET /api/registrations/event/:eventId
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('participant', 'name email phone department year registrationNo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: registrations.length, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark attendance
// @route   PUT /api/registrations/:id/attendance
const markAttendance = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { attendanceMarked: true },
      { new: true }
    ).populate('participant', 'name email');

    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerForEvent, getMyRegistrations, getEventRegistrations, markAttendance };
