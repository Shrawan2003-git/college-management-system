const Company = require('../models/Company');

// @desc    Get all company drives
// @route   GET /api/placement/companies
const getCompanies = async (req, res) => {
  try {
    const { status, branch, year } = req.query;
    const query = {};

    if (status) query.status = status;
    if (branch) query['eligibility.branches'] = { $in: [branch] };
    if (year) query['eligibility.years'] = { $in: [Number(year)] };

    const companies = await Company.find(query)
      .populate('postedBy', 'name email')
      .sort({ visitDate: 1 });

    res.json({ success: true, count: companies.length, companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single company drive
// @route   GET /api/placement/companies/:id
const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('applicants', 'name email department year');
    if (!company) return res.status(404).json({ success: false, message: 'Company drive not found' });
    res.json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add company drive
// @route   POST /api/placement/companies
const createCompany = async (req, res) => {
  try {
    const companyData = { ...req.body, postedBy: req.user._id };
    if (req.file) companyData.logo = req.file.path;

    // Parse eligibility if sent as JSON string
    if (typeof req.body.eligibility === 'string') {
      companyData.eligibility = JSON.parse(req.body.eligibility);
    }
    if (typeof req.body.jobRoles === 'string') {
      companyData.jobRoles = JSON.parse(req.body.jobRoles);
    }
    if (typeof req.body.driveStages === 'string') {
      companyData.driveStages = JSON.parse(req.body.driveStages);
    }

    const company = await Company.create(companyData);
    res.status(201).json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update company drive
// @route   PUT /api/placement/companies/:id
const updateCompany = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.logo = req.file.path;

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!company) return res.status(404).json({ success: false, message: 'Company drive not found' });
    res.json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Apply for company drive
// @route   POST /api/placement/companies/:id/apply
const applyForDrive = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company drive not found' });

    if (company.applicants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already applied for this drive' });
    }

    company.applicants.push(req.user._id);
    await company.save();

    res.json({ success: true, message: 'Application submitted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete company drive
// @route   DELETE /api/placement/companies/:id
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company drive not found' });
    res.json({ success: true, message: 'Company drive deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCompanies, getCompany, createCompany, updateCompany, applyForDrive, deleteCompany };
