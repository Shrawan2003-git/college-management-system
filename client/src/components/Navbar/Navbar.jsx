import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, GraduationCap, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardLink = () => {
    const routes = { admin: '/admin', incharge: '/incharge', placement_officer: '/placement/manage', student: '/dashboard' };
    return routes[user?.role] || '/dashboard';
  };

  const getRoleLabel = () => {
    const labels = { admin: 'Admin', incharge: 'Incharge', placement_officer: 'Placement Officer', student: 'Student' };
    return labels[user?.role] || 'User';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon"><GraduationCap size={22} /></div>
          <span className="brand-text">EduEvents</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} end>Home</NavLink>
          <NavLink to="/events" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Events</NavLink>
          <NavLink to="/placement" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Placement</NavLink>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">
                  {user.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user.name[0].toUpperCase()}</span>}
                </div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <span className="dropdown-role">{getRoleLabel()}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
