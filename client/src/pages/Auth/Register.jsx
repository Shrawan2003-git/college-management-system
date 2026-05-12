import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff, UserPlus } from 'lucide-react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ROLES = [
  { value: 'student', label: '🎓 Student', desc: 'Browse & register for events' },
  { value: 'incharge', label: '📋 Activity Incharge', desc: 'Create & manage events' },
  { value: 'placement_officer', label: '🏢 Placement Officer', desc: 'Manage company drives' }
];

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA', 'Other'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', year: '', registrationNo: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const selectRole = (role) => setForm({ ...form, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await API.post('/api/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created successfully!');
      const redirects = { admin: '/admin', incharge: '/incharge', placement_officer: '/placement/manage', student: '/dashboard' };
      navigate(redirects[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo"><GraduationCap size={28} /></div>
          <h2>Create Account</h2>
          <p>Join the EduEvents community</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selector */}
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="role-grid">
              {ROLES.map(r => (
                <button key={r.value} type="button" className={`role-card ${form.role === r.value ? 'selected' : ''}`}
                  onClick={() => selectRole(r.value)}>
                  <span className="role-label">{r.label}</span>
                  <span className="role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" type="text" placeholder="John Doe" className="form-input" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input name="phone" type="tel" placeholder="9876543210" className="form-input" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" placeholder="you@college.edu" className="form-input" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select name="department" className="form-select" value={form.department} onChange={handleChange}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {form.role === 'student' && (
              <div className="form-group">
                <label className="form-label">Year</label>
                <select name="year" className="form-select" value={form.year} onChange={handleChange}>
                  <option value="">Select Year</option>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            )}
          </div>

          {form.role === 'student' && (
            <div className="form-group">
              <label className="form-label">Registration Number</label>
              <input name="registrationNo" type="text" placeholder="e.g. 21BCA0001" className="form-input" value={form.registrationNo} onChange={handleChange} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <input name="password" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters"
                className="form-input" value={form.password} onChange={handleChange} required />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner-sm" style={{ borderTopColor: 'white', width: 20, height: 20 }} /> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
