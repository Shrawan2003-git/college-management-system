import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import API from '../../utils/api';
import Loader from '../../components/Loader/Loader';
import './Incharge.css';

const STATUS_COLORS = { pending: 'warning', approved: 'approved', rejected: 'rejected', completed: 'completed' };

export default function InchargeDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/events/my')
      .then(({ data }) => setEvents(data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const stats = {
    total: events.length,
    approved: events.filter(e => e.status === 'approved').length,
    pending: events.filter(e => e.status === 'pending').length,
    totalReg: events.reduce((a, e) => a + (e.currentParticipants || 0), 0)
  };

  return (
    <div className="page-wrapper dashboard-page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="page-header-row" style={{ marginBottom: 32 }}>
          <div>
            <h2>Incharge <span className="gradient-text">Dashboard</span></h2>
            <p>Manage your events and participants</p>
          </div>
          <Link to="/incharge/create" className="btn btn-primary">
            <Plus size={18} /> Create New Event
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 40 }}>
          {[
            { label: 'Total Events', value: stats.total, color: '#6C63FF' },
            { label: 'Approved', value: stats.approved, color: '#10B981' },
            { label: 'Pending', value: stats.pending, color: '#F59E0B' },
            { label: 'Total Registrations', value: stats.totalReg, color: '#EC4899' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon" style={{ background: `${s.color}20` }}>
                <Calendar size={22} style={{ color: s.color }} />
              </div>
              <div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Events List */}
        <h3 style={{ marginBottom: 20 }}>My Events</h3>
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No events created yet</h3>
            <p>Create your first event to get started</p>
            <Link to="/incharge/create" className="btn btn-primary" style={{ marginTop: 16 }}>
              <Plus size={16} /> Create Event
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Fee</th>
                  <th>Registrations</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id}>
                    <td>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{event.title}</div>
                      <span className="tag-chip">{event.category}</span>
                    </td>
                    <td>{new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                    <td>{event.fee === 0 ? <span className="badge badge-free">Free</span> : `₹${event.fee}`}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{event.currentParticipants}</span>
                      <span style={{ color: 'var(--text-muted)' }}>/{event.maxParticipants}</span>
                    </td>
                    <td><span className={`badge badge-${STATUS_COLORS[event.status]}`}>{event.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/events/${event._id}`} className="btn btn-secondary btn-sm">
                          <Eye size={14} /> View
                        </Link>
                        {event.status === 'approved' && (
                          <Link to={`/incharge/events/${event._id}/registrations`} className="btn btn-primary btn-sm">
                            <Users size={14} /> Participants
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
