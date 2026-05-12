const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'free'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  ticketId: {
    type: String,
    default: () => `TKT-${uuidv4().slice(0, 8).toUpperCase()}`
  },
  attendanceMarked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Prevent duplicate registrations
registrationSchema.index({ event: 1, participant: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
