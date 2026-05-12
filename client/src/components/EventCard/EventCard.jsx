import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, IndianRupee, Clock } from 'lucide-react';
import './EventCard.css';

const CATEGORY_COLORS = {
  technical: '#6C63FF',
  cultural: '#EC4899',
  sports: '#10B981',
  workshop: '#F59E0B',
  seminar: '#3B82F6',
  hackathon: '#F97316',
  other: '#94A3B8'
};

export default function EventCard({ event }) {
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isFull = event.currentParticipants >= event.maxParticipants;
  const seatsLeft = event.maxParticipants - event.currentParticipants;
  const categoryColor = CATEGORY_COLORS[event.category] || '#94A3B8';

  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <div className="event-card-banner">
        {event.banner ? (
          <img src={event.banner} alt={event.title} loading="lazy" />
        ) : (
          <div className="event-card-banner-placeholder" style={{ background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}44)` }}>
            <span className="banner-emoji">🎓</span>
          </div>
        )}
        <div className="event-card-badges">
          <span className="badge badge-primary" style={{ background: `${categoryColor}22`, color: categoryColor }}>
            {event.category}
          </span>
          {event.fee === 0 ? (
            <span className="badge badge-free">Free</span>
          ) : (
            <span className="badge badge-paid">₹{event.fee}</span>
          )}
        </div>
        {(isDeadlinePassed || isFull) && (
          <div className="event-card-overlay">
            <span>{isFull ? 'Fully Booked' : 'Registration Closed'}</span>
          </div>
        )}
      </div>

      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>
        {event.shortDescription && <p className="event-desc">{event.shortDescription}</p>}

        <div className="event-meta">
          <div className="meta-item">
            <Calendar size={14} />
            <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="meta-item">
            <MapPin size={14} />
            <span>{event.venue}</span>
          </div>
          <div className="meta-item">
            <Users size={14} />
            <span>{isFull ? 'Full' : `${seatsLeft} seats left`}</span>
          </div>
        </div>

        <div className="event-card-footer">
          <div className="event-fee">
            {event.fee === 0 ? (
              <span className="fee-free">Free Entry</span>
            ) : (
              <span className="fee-amount"><IndianRupee size={14} />{event.fee}</span>
            )}
          </div>
          <div className="deadline-info">
            <Clock size={12} />
            <span>Closes {new Date(event.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
