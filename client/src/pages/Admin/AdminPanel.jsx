import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Users, Calendar, CreditCard, Clock, BarChart3, Shield } from 'lucide-react';
import API from '../../utils/api';
import Loader from '../../components/Loader/Loader';
import './Admin.css';

const TABS = ['Overview', 'Events', 'Users', 'Payments'];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          API.get('/api/admin/dashboard'),
          API.get('/api/admin/events?status=pending')
        ]);
        setStats(statsRes.data.stats);
        setEvents(eventsRes.data.events || []);
      } catch { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'Events') {
      API.get(`/api/admin/events${filterStatus ? `?status=${filterStatus}` : ''}`).then(({ data }) => setEvents(data.events || []));
    }
    if (activeTab === 'Users') {
      API.get('/api/admin/users').then(({ data }) => setUsers(data.users || []));
    }
    if (activeTab === 'Payments') {
      API.get('/api/admin/payments').then(({ data }) => setPayments(data.payments || []));
    }
  }, [activeTab, filterStatus]);

  const handleApprove = async (id) => {
    try {
      await API.put(`/api/admin/events/${id}/approve`);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Event approved!');
      if (stats) setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await API.put(`/api/admin/events/${id}/reject`, { reason });
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Event rejected.');
    } catch { toast.error('Failed to reject'); }
  };

  const toggleUser = async (id, currentStatus) => {
    try {
      await API.put(`/api/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${currentStatus ? 'suspended' : 'activated'}`);
    } catch { toast.error('Failed to update user'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-wrapper dashboard-page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="page-header" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="stat-icon" style={{ background: '#6C63FF20', width: 48, height: 48 }}>
              <Shield size={22} style={{ color: '#6C63FF' }} />
            </div>
            <div>
              <h2>Admin <span className="gradient-text">Panel</span></h2>
              <p>Full control over the platform</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button key={tab} className={`admin-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
              {tab === 'Overview' && stats?.pendingApprovals > 0 && (
                <span className="tab-badge">{stats.pendingApprovals}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'Overview' && stats && (
          <div className="page-enter">
            <div className="grid-4" style={{ marginBottom: 40 }}>
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#6C63FF' },
                { label: 'Approved Events', value: stats.totalEvents, icon: Calendar, color: '#10B981' },
                { label: 'Registrations', value: stats.totalRegistrations, icon: CheckCircle, color: '#F59E0B' },
                { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: CreditCard, color: '#EC4899' },
                { label: 'Upcoming Events', value: stats.upcomingEvents, icon: Clock, color: '#3B82F6' },
                { label: 'Pending Approvals', value: stats.pendingApprovals, icon: BarChart3, color: '#F97316' },
                { label: 'Companies', value: stats.totalCompanies, icon: BarChart3, color: '#8B5CF6' },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{ background: `${s.color}20` }}>
                    <s.icon size={22} style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom: 20 }}>⏳ Pending Event Approvals</h3>
            {events.filter(e => e.status === 'pending').map(event => (
              <PendingEventCard key={event._id} event={event} onApprove={handleApprove} onReject={handleReject} />
            ))}
            {events.filter(e => e.status === 'pending').length === 0 && (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">✅</div>
                <h3>All caught up!</h3>
                <p>No events pending approval</p>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'Events' && (
          <div className="page-enter">
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {['pending', 'approved', 'rejected', 'completed', ''].map(s => (
                <button key={s || 'all'} className={`filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                  {s || 'All'}
                </button>
              ))}
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Event</th><th>By</th><th>Date</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event._id}>
                      <td><div style={{ fontWeight: 600 }}>{event.title}</div><span className="tag-chip">{event.category}</span></td>
                      <td>{event.createdBy?.name}<br /><small style={{ color: 'var(--text-muted)' }}>{event.createdBy?.department}</small></td>
                      <td>{new Date(event.date).toLocaleDateString('en-IN')}</td>
                      <td>{event.fee === 0 ? <span className="badge badge-free">Free</span> : `₹${event.fee}`}</td>
                      <td><span className={`badge badge-${event.status === 'approved' ? 'approved' : event.status === 'pending' ? 'warning' : 'rejected'}`}>{event.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {event.status === 'pending' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleApprove(event._id)}>Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleReject(event._id)}>Reject</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'Users' && (
          <div className="page-enter">
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><div style={{ fontWeight: 600 }}>{u.name}</div><small style={{ color: 'var(--text-muted)' }}>{u.email}</small></td>
                      <td><span className="badge badge-primary">{u.role}</span></td>
                      <td>{u.department || '—'}</td>
                      <td><span className={`badge ${u.isActive ? 'badge-approved' : 'badge-rejected'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleUser(u._id, u.isActive)}>
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'Payments' && (
          <div className="page-enter">
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Student</th><th>Event</th><th>Amount</th><th>Razorpay ID</th><th>Date</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td><div style={{ fontWeight: 600 }}>{p.user?.name}</div><small style={{ color: 'var(--text-muted)' }}>{p.user?.email}</small></td>
                      <td>{p.event?.title}</td>
                      <td><span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{p.amount}</span></td>
                      <td><code style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono' }}>{p.razorpayPaymentId}</code></td>
                      <td>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PendingEventCard({ event, onApprove, onReject }) {
  return (
    <div className="card pending-event-card" style={{ marginBottom: 16 }}>
      <div className="pending-event-info">
        {event.banner && <img src={event.banner} alt={event.title} className="pending-banner" />}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-primary">{event.category}</span>
            <span className="badge badge-warning">Pending</span>
          </div>
          <h4>{event.title}</h4>
          <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
            By: {event.createdBy?.name} · {new Date(event.date).toLocaleDateString('en-IN')} · {event.venue}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{event.shortDescription}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="btn btn-success" onClick={() => onApprove(event._id)}>
          <CheckCircle size={16} /> Approve
        </button>
        <button className="btn btn-danger" onClick={() => onReject(event._id)}>
          <XCircle size={16} /> Reject
        </button>
      </div>
    </div>
  );
}
