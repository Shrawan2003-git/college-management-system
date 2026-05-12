const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const Company = require('../models/Company');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, totalEvents, upcomingEvents,
      totalRegistrations, pendingApprovals,
      totalRevenueResult, totalCompanies
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({ status: 'approved', date: { $gte: new Date() } }),
      Registration.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Company.countDocuments()
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalUsers, totalEvents, upcomingEvents,
        totalRegistrations, pendingApprovals,
        totalRevenue, totalCompanies
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all events (admin view)
// @route   GET /api/admin/events
const getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const events = await Event.find(query)
      .populate('createdBy', 'name email department')
      .sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve event
// @route   PUT /api/admin/events/:id/approve
const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', rejectionReason: '' },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reject event
// @route   PUT /api/admin/events/:id/reject
const rejectEvent = async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot modify admin account' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'suspended'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'paid' })
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats, getAllEvents, approveEvent, rejectEvent, getAllUsers, toggleUserStatus, getAllPayments };
