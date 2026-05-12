import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Upload } from 'lucide-react';
import API from '../../utils/api';
import './Incharge.css';

const CATEGORIES = ['technical', 'cultural', 'sports', 'workshop', 'seminar', 'hackathon', 'other'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '', category: 'technical',
    venue: '', date: '', endDate: '', registrationDeadline: '',
    fee: 0, maxParticipants: 100, tags: '', highlights: '',
    contactEmail: '', contactPhone: ''
  });
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBanner = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (banner) formData.append('banner', banner);

      await API.post('/api/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Event created! Waiting for admin approval.');
      navigate('/incharge');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container-sm" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate('/incharge')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="page-header">
          <h2>Create <span className="gradient-text">New Event</span></h2>
          <p>Fill in the details below. Your event will be reviewed by admin before going live.</p>
        </div>

        <form onSubmit={handleSubmit} className="create-event-form">
          {/* Banner Upload */}
          <div className="banner-upload" onClick={() => document.getElementById('bannerInput').click()}>
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner preview" />
            ) : (
              <div className="banner-placeholder">
                <Upload size={32} />
                <p>Click to upload event banner</p>
                <span>JPG, PNG, WEBP — Max 5MB</span>
              </div>
            )}
            <input id="bannerInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBanner} />
          </div>

          <div className="card">
            <h4 style={{ marginBottom: 20 }}>Basic Information</h4>

            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input name="title" className="form-input" placeholder="e.g. National Hackathon 2025" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Short Description</label>
              <input name="shortDescription" className="form-input" placeholder="One-line summary (max 200 chars)" value={form.shortDescription} onChange={handleChange} maxLength={200} />
            </div>

            <div className="form-group">
              <label className="form-label">Full Description *</label>
              <textarea name="description" className="form-textarea" placeholder="Detailed event description..." value={form.description} onChange={handleChange} required style={{ minHeight: 150 }} />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Venue *</label>
                <input name="venue" className="form-input" placeholder="e.g. Main Auditorium" value={form.venue} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Max Participants *</label>
                <input name="maxParticipants" type="number" min={1} className="form-input" value={form.maxParticipants} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input name="date" type="datetime-local" className="form-input" value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Event End Date</label>
                <input name="endDate" type="datetime-local" className="form-input" value={form.endDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Deadline *</label>
                <input name="registrationDeadline" type="datetime-local" className="form-input" value={form.registrationDeadline} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Participation Fee (₹) *</label>
                <input name="fee" type="number" min={0} className="form-input" placeholder="0 for free event" value={form.fee} onChange={handleChange} required />
                {Number(form.fee) === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: 4 }}>🎉 This will be a free event</p>}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h4 style={{ marginBottom: 20 }}>Additional Details</h4>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input name="tags" className="form-input" placeholder="e.g. coding, ai, design" value={form.tags} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Highlights (one per line)</label>
              <textarea name="highlights" className="form-textarea" placeholder="Cash prizes worth ₹50,000&#10;Certificates for all participants&#10;Industry mentors" value={form.highlights} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input name="contactEmail" type="email" className="form-input" placeholder="contact@college.edu" value={form.contactEmail} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input name="contactPhone" className="form-input" placeholder="9876543210" value={form.contactPhone} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: 24 }}>
            {loading ? 'Creating Event...' : '🚀 Submit Event for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
}
