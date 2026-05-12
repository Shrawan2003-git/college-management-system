const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'workshop', 'seminar', 'hackathon', 'other'],
    required: true
  },
  banner: {
    type: String,
    default: ''
  },
  venue: {
    type: String,
    required: [true, 'Venue is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  endDate: {
    type: Date
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Max participants is required']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  tags: [String],
  highlights: [String],
  contactEmail: String,
  contactPhone: String
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
