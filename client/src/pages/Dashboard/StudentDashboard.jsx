import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, payRes] = await Promise.all([
          API.get('/api/registrations/my'),
          API.get('/api/payment/history')
        ]);
        setRegistrations(regRes.data.registrations || []);
        setPayments(payRes.data.payments || []);
      } catch {
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  const upcomingRegs = registrations.filter(r => new Date(r.event?.date) >= new Date());
  const pastRegs = registrations.filter(r => r.event?.date && new Date(r.event.date) < new Date());

  return (
    <div className="page-wrapper dashboard-page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Header */}
        <div className="page-header">
          <h2>Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h2>
          <p>{user?.department} · {user?.year ? `Year ${user.year}` : ''} · {user?.registrationNo}</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 40 }}>
          {[
            { icon: Ticket, label: 'Total Registrations', value: registrations.length, color: '#6C63FF' },
            { icon: Calendar, label: 'Upcoming Events', value: upcomingRegs.length, color: '#10B981' },
            { icon: CheckCircle, label: 'Events Attended', value: registrations.filter(r => r.attendanceMarked).length, color: '#F59E0B' },
            { icon: CreditCard, label: 'Total Paid', value: `₹${payments.reduce((a, p) => a + (p.amount || 0), 0)}`, color: '#EC4899' },
          ].map(stat => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-icon" style={{ background: `${stat.color}20` }}>
                <stat.icon size={22} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Registrations */}
        <div className="section-header-row">
          <h3>My Registered Events</h3>
          <Link to="/events" className="btn btn-secondary btn-sm">Browse More Events</Link>
        </div>

        {registrations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎟️</div>
            <h3>No registrations yet</h3>
            <p>Browse events and register to see them here</p>
            <Link to="/events" className="btn btn-primary" style={{ marginTop: 16 }}>Explore Events</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {registrations.map(reg => (
              <div key={reg._id} className="registration-item card">
                <div className="reg-event-info">
                  {reg.event?.banner && <img src={reg.event.banner} alt={reg.event.title} className="reg-banner" />}
                  <div className="reg-details">
                    <h4>{reg.event?.title || 'Event'}</h4>
                    <div className="reg-meta">
                      <span><Calendar size={13} /> {reg.event?.date ? new Date(reg.event.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A'}</span>
                      <span style={{ marginLeft: 12 }}>{reg.event?.venue}</span>
                    </div>
                  </div>
                </div>
                <div className="reg-right">
                  <div className="ticket-id-display" style={{ fontSize: '1rem' }}>{reg.ticketId}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <span className={`badge badge-${reg.paymentStatus}`}>{reg.paymentStatus}</span>
                    {reg.attendanceMarked && <span className="badge badge-success">✓ Attended</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <>
            <div style={{ marginTop: 48, marginBottom: 20 }}>
              <h3>Payment History</h3>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(pay => (
                    <tr key={pay._id}>
                      <td>{pay.event?.title}</td>
                      <td>₹{pay.amount}</td>
                      <td><span className="badge badge-success">Paid</span></td>
                      <td>{new Date(pay.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
