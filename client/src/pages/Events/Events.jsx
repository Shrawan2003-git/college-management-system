import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import API from '../../utils/api';
import EventCard from '../../components/EventCard/EventCard';
import Loader from '../../components/Loader/Loader';
import './Events.css';

const CATEGORIES = ['all', 'technical', 'cultural', 'sports', 'workshop', 'seminar', 'hackathon', 'other'];

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const fee = searchParams.get('fee') || 'all';
  const page = parseInt(searchParams.get('page') || '1');

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (search) params.set('search', search);
        if (fee !== 'all') params.set('fee', fee);
        params.set('page', page);
        params.set('limit', 9);

        const { data } = await API.get(`/api/events?${params}`);
        setEvents(data.events || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [category, search, fee, page]);

  return (
    <div className="page-wrapper events-page">
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ paddingTop: 40 }}>
          <h2>Upcoming <span className="gradient-text">Events</span></h2>
          <p>{total} events available</p>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search />
            <input className="search-input" placeholder="Search events..." value={search}
              onChange={e => updateParam('search', e.target.value)} />
          </div>

          <div className="filter-group">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`filter-btn ${category === cat ? 'active' : ''}`}
                onClick={() => updateParam('category', cat)}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <select className="form-select" style={{ width: 'auto' }} value={fee} onChange={e => updateParam('fee', e.target.value)}>
            <option value="all">All Events</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Only</option>
          </select>
        </div>

        {/* Events Grid */}
        {loading ? (
          <Loader fullScreen={false} />
        ) : events.length > 0 ? (
          <>
            <div className="grid-3">
              {events.map(event => <EventCard key={event._id} event={event} />)}
            </div>
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${page === p ? 'active' : ''}`}
                    onClick={() => updateParam('page', p)}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No events found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
