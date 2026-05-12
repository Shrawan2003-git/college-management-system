const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Company description is required']
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required']
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  jobRoles: [{
    type: String,
    trim: true
  }],
  package: {
    type: String,   // e.g. "6-12 LPA"
    required: true
  },
  eligibility: {
    minCGPA: { type: Number, default: 6.0 },
    maxBacklogs: { type: Number, default: 0 },
    branches: [{ type: String }],
    years: [{ type: Number }]
  },
  driveStages: [{ type: String }],
  registrationLink: {
    type: String,
    default: ''
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
