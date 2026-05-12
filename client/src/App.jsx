import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar/Navbar';
import Loader from './components/Loader/Loader';

import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Events from './pages/Events/Events';
import EventDetail from './pages/Events/EventDetail';
import Placement from './pages/Placement/Placement';
import CompanyDetail from './pages/Placement/CompanyDetail';

import StudentDashboard from './pages/Dashboard/StudentDashboard';
import InchargeDashboard from './pages/Incharge/InchargeDashboard';
import CreateEvent from './pages/Incharge/CreateEvent';
import EventRegistrations from './pages/Incharge/EventRegistrations';
import AdminPanel from './pages/Admin/AdminPanel';
import PlacementDashboard from './pages/Placement/PlacementDashboard';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) {
    const redirectMap = {
      admin: '/admin',
      incharge: '/incharge',
      placement_officer: '/placement/manage',
      student: '/dashboard'
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/placement" element={<Placement />} />
        <Route path="/placement/:id" element={<CompanyDetail />} />

        {/* Auth */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Student */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />

        {/* Incharge */}
        <Route path="/incharge" element={<ProtectedRoute roles={['incharge', 'admin']}><InchargeDashboard /></ProtectedRoute>} />
        <Route path="/incharge/create" element={<ProtectedRoute roles={['incharge', 'admin']}><CreateEvent /></ProtectedRoute>} />
        <Route path="/incharge/events/:id/registrations" element={<ProtectedRoute roles={['incharge', 'admin']}><EventRegistrations /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />

        {/* Placement Officer */}
        <Route path="/placement/manage" element={<ProtectedRoute roles={['placement_officer', 'admin']}><PlacementDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0F1729',
              color: '#F1F5F9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem'
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#0F1729' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#0F1729' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
