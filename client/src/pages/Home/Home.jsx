import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Building2, Trophy, ChevronRight, Zap } from 'lucide-react';
import API from '../../utils/api';
import EventCard from '../../components/EventCard/EventCard';
import './Home.css';

const STATS = [
  { icon: Calendar, label: 'Events Hosted', value: '200+', color: '#6C63FF' },
  { icon: Users, label: 'Students Registered', value: '5000+', color: '#10B981' },
  { icon: Building2, label: 'Companies Visited', value: '80+', color: '#F59E0B' },
  { icon: Trophy, label: 'Awards Given', value: '500+', color: '#EC4899' }
];

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Hackathon'];

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get('/api/events?limit=6');
        setFeaturedEvents(data.events || []);
      } catch {
        setFeaturedEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="container hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>College Event Management System</span>
          </div>
          <h1 className="hero-title">
            Your Campus <br />
            <span className="gradient-text">Events & Careers</span><br />
            All in One Place
          </h1>
          <p className="hero-subtitle">
            Browse upcoming events, register with ease, pay fees securely, and track
            internship & placement drives — everything for your college journey.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary btn-lg">
              Explore Events <ArrowRight size={18} />
            </Link>
            <Link to="/placement" className="btn btn-secondary btn-lg">
              View Placements <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-icon" style={{ background: `${stat.color}20` }}>
                  <stat.icon size={26} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explore by <span className="gradient-text">Category</span></h2>
            <p className="section-subtitle">Find events that match your interests</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.slice(1).map((cat) => (
              <Link key={cat} to={`/events?category=${cat.toLowerCase()}`} className="category-pill">
                <span>{cat}</span>
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Upcoming <span className="gradient-text">Events</span></h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Don't miss out on the latest happenings</p>
            </div>
            <Link to="/events" className="btn btn-secondary">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="events-skeleton-grid">
              {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid-3">
              {featuredEvents.slice(0, 6).map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No events yet</h3>
              <p>Check back soon for upcoming events!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg" />
            <div className="cta-content">
              <h2>Ready to get involved?</h2>
              <p>Join thousands of students participating in college events and securing placements.</p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Join Now — It's Free <ArrowRight size={18} />
                </Link>
                <Link to="/placement" className="btn btn-secondary btn-lg">
                  View Placement Drives
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-text" style={{ fontSize: '1.3rem' }}>🎓 EduEvents</span>
              <p>Your complete college event & placement management system.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h5>Platform</h5>
                <Link to="/events">Events</Link>
                <Link to="/placement">Placements</Link>
                <Link to="/register">Register</Link>
              </div>
              <div className="footer-col">
                <h5>Account</h5>
                <Link to="/login">Login</Link>
                <Link to="/dashboard">Dashboard</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} EduEvents. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
