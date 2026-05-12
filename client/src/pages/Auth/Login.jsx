import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff, LogIn } from 'lucide-react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/api/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      const redirects = { admin: '/admin', incharge: '/incharge', placement_officer: '/placement/manage', student: '/dashboard' };
      navigate(redirects[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo"><GraduationCap size={28} /></div>
          <h2>Welcome Back</h2>
          <p>Sign in to your EduEvents account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" placeholder="you@college.edu" className="form-input"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <input name="password" type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                className="form-input" value={form.password} onChange={handleChange} required />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner-sm" style={{ borderTopColor: 'white', width: 20, height: 20 }} /> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one here</Link>
        </p>
      </div>
    </div>
  );
}
