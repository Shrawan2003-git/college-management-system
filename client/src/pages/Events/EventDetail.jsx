import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Users, IndianRupee, Clock, Tag, ArrowLeft, CheckCircle } from 'lucide-react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { initiatePayment } from '../../utils/razorpay';
import Loader from '../../components/Loader/Loader';
import './Events.css';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await API.get(`/api/events/${id}`);
        setEvent(data.event);
        // Check if already registered
        if (user) {
          const regData = await API.get('/api/registrations/my');
          const isReg = regData.data.registrations.some(r => r.event?._id === id && (r.paymentStatus === 'paid' || r.paymentStatus === 'free'));
          setRegistered(isReg);
        }
      } catch {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleFreeRegister = async () => {
    if (!user) return navigate('/login');
    setRegistering(true);
    try {
      await API.post('/api/registrations', { eventId: id });
      setRegistered(true);
      toast.success('Registered successfully! Check your email for confirmation.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handlePaidRegister = async () => {
    if (!user) return navigate('/login');
    setRegistering(true);
    try {
      const { data } = await API.post('/api/payment/create-order', { eventId: id });
      initiatePayment({
        order: data.order,
        user,
        event,
        onSuccess: async (response) => {
          try {
            await API.post('/api/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              eventId: id
            });
            setRegistered(true);
            toast.success('Payment successful! Check your email for the ticket.');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        onFailure: (msg) => toast.error(msg || 'Payment cancelled')
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <Loader />;
  if (!event) return null;

  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isFull = event.currentParticipants >= event.maxParticipants;
  const seatsLeft = event.maxParticipants - event.currentParticipants;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="event-detail-grid">
          {/* Left */}
          <div className="event-detail-main">
            {event.banner && (
              <div className="event-detail-banner">
                <img src={event.banner} alt={event.title} />
              </div>
            )}

            <div className="card" style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <span className="badge badge-primary">{event.category}</span>
                {event.tags?.map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
              </div>
              <h2 style={{ marginBottom: 16 }}>{event.title}</h2>
              <p style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>{event.description}</p>

              {event.highlights?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ marginBottom: 12 }}>Highlights</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {event.highlights.map((h, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <CheckCircle size={16} style={{ color: 'var(--success)', marginTop: 2, flexShrink: 0 }} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="event-detail-sidebar">
            <div className="card event-register-card">
              <div className="event-fee-display">
                {event.fee === 0 ? (
                  <span className="fee-free-big">Free Entry</span>
                ) : (
                  <span className="fee-paid-big">₹{event.fee}</span>
                )}
              </div>

              <div className="event-info-list">
                <div className="event-info-item">
                  <Calendar size={16} className="info-icon" />
                  <div>
                    <div className="info-label">Event Date</div>
                    <div className="info-value">{new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
                  </div>
                </div>
                <div className="event-info-item">
                  <Clock size={16} className="info-icon" />
                  <div>
                    <div className="info-label">Registration Deadline</div>
                    <div className="info-value">{new Date(event.registrationDeadline).toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
                  </div>
                </div>
                <div className="event-info-item">
                  <MapPin size={16} className="info-icon" />
                  <div>
                    <div className="info-label">Venue</div>
                    <div className="info-value">{event.venue}</div>
                  </div>
                </div>
                <div className="event-info-item">
                  <Users size={16} className="info-icon" />
                  <div>
                    <div className="info-label">Seats</div>
                    <div className="info-value">{isFull ? '🔴 Fully Booked' : `${seatsLeft} of ${event.maxParticipants} left`}</div>
                  </div>
                </div>
              </div>

              <div className="seats-bar">
                <div className="seats-progress" style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }} />
              </div>

              {registered ? (
                <div className="alert alert-success">
                  <CheckCircle size={16} /> You're registered for this event!
                </div>
              ) : isDeadlinePassed ? (
                <div className="alert alert-warning">Registration deadline has passed</div>
              ) : isFull ? (
                <div className="alert alert-error">Event is fully booked</div>
              ) : !user ? (
                <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/login')}>
                  Login to Register
                </button>
              ) : user.role !== 'student' ? (
                <div className="alert alert-warning">Only students can register for events</div>
              ) : event.fee === 0 ? (
                <button className="btn btn-primary btn-full btn-lg" onClick={handleFreeRegister} disabled={registering}>
                  {registering ? 'Registering...' : '🎟️ Register for Free'}
                </button>
              ) : (
                <button className="btn btn-primary btn-full btn-lg" onClick={handlePaidRegister} disabled={registering}>
                  {registering ? 'Processing...' : `💳 Pay ₹${event.fee} & Register`}
                </button>
              )}

              {event.createdBy && (
                <div className="organizer-info">
                  <div className="organizer-label">Organized by</div>
                  <div className="organizer-name">{event.createdBy.name}</div>
                  {event.contactEmail && <div className="organizer-contact">{event.contactEmail}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
