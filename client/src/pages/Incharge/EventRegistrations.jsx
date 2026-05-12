import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle, Download, Users } from 'lucide-react';
import API from '../../utils/api';
import Loader from '../../components/Loader/Loader';
import './Incharge.css';

export default function EventRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ registrations: [], count: 0 });
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, eventRes] = await Promise.all([
          API.get(`/api/registrations/event/${id}`),
          API.get(`/api/events/${id}`)
        ]);
        setData(regRes.data);
        setEvent(eventRes.data.event);
      } catch { toast.error('Failed to load registrations'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const markAttendance = async (regId) => {
    try {
      await API.put(`/api/registrations/${regId}/attendance`);
      setData(prev => ({
        ...prev,
        registrations: prev.registrations.map(r => r._id === regId ? { ...r, attendanceMarked: true } : r)
      }));
      toast.success('Attendance marked!');
    } catch { toast.error('Failed to mark attendance'); }
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Department', 'Year', 'RegNo', 'Ticket ID', 'Payment', 'Attendance'];
    const rows = data.registrations.map(r => [
      r.participant?.name, r.participant?.email, r.participant?.phone,
      r.participant?.department, r.participant?.year, r.participant?.registrationNo,
      r.ticketId, r.paymentStatus, r.attendanceMarked ? 'Yes' : 'No'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title || 'event'}-participants.csv`;
    a.click();
  };

  if (loading) return <Loader />;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate('/incharge')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="page-header-row" style={{ marginBottom: 32 }}>
          <div>
            <h2>{event?.title}</h2>
            <p><Users size={14} style={{ display: 'inline', marginRight: 6 }} />{data.count} registered participants</p>
          </div>
          <button className="btn btn-secondary" onClick={downloadCSV}>
            <Download size={16} /> Download CSV
          </button>
        </div>

        {data.registrations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No registrations yet</h3>
            <p>Participants will appear here once they register</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Department / Year</th>
                  <th>Reg. No.</th>
                  <th>Ticket ID</th>
                  <th>Payment</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {data.registrations.map(reg => (
                  <tr key={reg._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{reg.participant?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{reg.participant?.email}</div>
                    </td>
                    <td>{reg.participant?.department} · Year {reg.participant?.year}</td>
                    <td><code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>{reg.participant?.registrationNo}</code></td>
                    <td><code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: 'var(--primary-light)' }}>{reg.ticketId}</code></td>
                    <td><span className={`badge badge-${reg.paymentStatus}`}>{reg.paymentStatus}</span></td>
                    <td>
                      {reg.attendanceMarked ? (
                        <span className="badge badge-success"><CheckCircle size={12} /> Attended</span>
                      ) : (
                        <button className="btn btn-sm btn-secondary" onClick={() => markAttendance(reg._id)}>
                          Mark Present
                        </button>
                      )}
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
