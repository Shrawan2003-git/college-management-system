import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Building2, Users, Eye } from 'lucide-react';
import API from '../../utils/api';
import Loader from '../../components/Loader/Loader';
import './Placement.css';

export default function PlacementDashboard() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', visitDate: '', applicationDeadline: '',
    jobRoles: '', package: '', driveStages: '',
    'eligibility.minCGPA': '6.0', 'eligibility.maxBacklogs': '0',
    'eligibility.branches': 'CSE,IT,ECE', 'eligibility.years': '3,4'
  });
  const [logo, setLogo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/api/placement/companies')
      .then(({ data }) => setCompanies(data.companies || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      const eligibility = {
        minCGPA: parseFloat(form['eligibility.minCGPA']),
        maxBacklogs: parseInt(form['eligibility.maxBacklogs']),
        branches: form['eligibility.branches'].split(',').map(s => s.trim()),
        years: form['eligibility.years'].split(',').map(s => parseInt(s.trim()))
      };
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('visitDate', form.visitDate);
      fd.append('applicationDeadline', form.applicationDeadline);
      fd.append('package', form.package);
      fd.append('jobRoles', JSON.stringify(form.jobRoles.split(',').map(s => s.trim())));
      fd.append('driveStages', JSON.stringify(form.driveStages.split('\n').filter(Boolean)));
      fd.append('eligibility', JSON.stringify(eligibility));
      if (logo) fd.append('logo', logo);

      const { data } = await API.post('/api/placement/companies', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCompanies(prev => [data.company, ...prev]);
      setShowForm(false);
      toast.success('Company drive added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add company');
    } finally { setSubmitting(false); }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-wrapper dashboard-page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="page-header-row" style={{ marginBottom: 32 }}>
          <div>
            <h2>Placement Officer <span className="gradient-text">Dashboard</span></h2>
            <p>Manage company visits and placement drives</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> {showForm ? 'Cancel' : 'Add Company Drive'}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 32 }}>
            <h4 style={{ marginBottom: 20 }}>Add Company Drive</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input className="form-input" placeholder="e.g. Google India" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Package (CTC) *</label>
                <input className="form-input" placeholder="e.g. 10-15 LPA" value={form.package} onChange={e => setForm({...form, package: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" placeholder="About the company and role..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Visit Date *</label>
                <input type="date" className="form-input" value={form.visitDate} onChange={e => setForm({...form, visitDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline *</label>
                <input type="date" className="form-input" value={form.applicationDeadline} onChange={e => setForm({...form, applicationDeadline: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Job Roles (comma separated) *</label>
              <input className="form-input" placeholder="SDE, Data Analyst, DevOps" value={form.jobRoles} onChange={e => setForm({...form, jobRoles: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Drive Stages (one per line)</label>
              <textarea className="form-textarea" placeholder="Aptitude Test&#10;Technical Round&#10;HR Interview" value={form.driveStages} onChange={e => setForm({...form, driveStages: e.target.value})} style={{ minHeight: 100 }} />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Min CGPA</label>
                <input type="number" step="0.1" min="0" max="10" className="form-input" value={form['eligibility.minCGPA']} onChange={e => setForm({...form, 'eligibility.minCGPA': e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Backlogs</label>
                <input type="number" min="0" className="form-input" value={form['eligibility.maxBacklogs']} onChange={e => setForm({...form, 'eligibility.maxBacklogs': e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Eligible Years (e.g. 3,4)</label>
                <input className="form-input" value={form['eligibility.years']} onChange={e => setForm({...form, 'eligibility.years': e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Eligible Branches (comma separated)</label>
              <input className="form-input" value={form['eligibility.branches']} onChange={e => setForm({...form, 'eligibility.branches': e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Logo</label>
              <input type="file" accept="image/*" className="form-input" onChange={e => setLogo(e.target.files[0])} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? 'Adding...' : '✅ Add Company Drive'}
            </button>
          </form>
        )}

        {/* Companies Table */}
        <h3 style={{ marginBottom: 20 }}>All Company Drives ({companies.length})</h3>
        {companies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3>No companies added yet</h3>
            <p>Add your first company drive above</p>
          </div>
        ) : (
          <div className="grid-3">
            {companies.map(company => (
              <Link key={company._id} to={`/placement/${company._id}`} className="company-card">
                <div className="company-card-header">
                  <div className="company-logo">
                    {company.logo ? <img src={company.logo} alt={company.name} /> : <Building2 size={24} />}
                  </div>
                  <div>
                    <h4 className="company-name">{company.name}</h4>
                    <span className={`badge badge-${company.status}`}>{company.status}</span>
                  </div>
                </div>
                <p className="company-desc">{company.description}</p>
                <div className="company-package"><span>{company.package}</span></div>
                <div className="company-footer">
                  <span className="company-date"><Users size={13} /> {company.applicants?.length || 0} applicants</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
