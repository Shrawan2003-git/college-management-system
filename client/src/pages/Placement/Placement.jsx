import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Calendar, Briefcase, ChevronRight, Search } from 'lucide-react';
import API from '../../utils/api';
import Loader from '../../components/Loader/Loader';
import './Placement.css';

const STATUS_OPTIONS = ['all', 'upcoming', 'ongoing', 'completed'];
const BRANCHES = ['all', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA'];

export default function Placement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || 'all';
  const branch = searchParams.get('branch') || 'all';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        if (branch !== 'all') params.set('branch', branch);
        const { data } = await API.get(`/api/placement/companies?${params}`);
        let result = data.companies || [];
        if (search) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
        setCompanies(result);
      } catch { setCompanies([]); }
      finally { setLoading(false); }
    };
    fetchCompanies();
  }, [status, branch, search]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  return (
    <div className="page-wrapper placement-page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Header */}
        <div className="placement-hero">
          <div className="orb" style={{ width: 300, height: 300, background: 'rgba(245,166,35,0.1)', top: -50, right: -50, position: 'absolute', borderRadius: '50%', filter: 'blur(80px)' }} />
          <h2 className="section-title">Internship & <span className="gradient-text">Placement Drives</span></h2>
          <p className="section-subtitle">Companies visiting your campus — don't miss your opportunity</p>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search />
            <input className="search-input" placeholder="Search companies..." value={search}
              onChange={e => updateParam('search', e.target.value)} />
          </div>
          <div className="filter-group">
            {STATUS_OPTIONS.map(s => (
              <button key={s} className={`filter-btn ${status === s ? 'active' : ''}`} onClick={() => updateParam('status', s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={branch} onChange={e => updateParam('branch', e.target.value)}>
            {BRANCHES.map(b => <option key={b} value={b}>{b === 'all' ? 'All Branches' : b}</option>)}
          </select>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <Loader fullScreen={false} />
        ) : companies.length > 0 ? (
          <div className="grid-3">
            {companies.map(company => (
              <Link key={company._id} to={`/placement/${company._id}`} className="company-card">
                <div className="company-card-header">
                  <div className="company-logo">
                    {company.logo ? <img src={company.logo} alt={company.name} /> : <Building2 size={30} />}
                  </div>
                  <div>
                    <h4 className="company-name">{company.name}</h4>
                    <span className={`badge badge-${company.status}`}>{company.status}</span>
                  </div>
                </div>

                <p className="company-desc">{company.description}</p>

                <div className="company-package">
                  <Briefcase size={14} />
                  <span>{company.package}</span>
                </div>

                <div className="company-roles">
                  {company.jobRoles?.slice(0, 2).map(role => (
                    <span key={role} className="tag-chip">{role}</span>
                  ))}
                  {company.jobRoles?.length > 2 && <span className="tag-chip">+{company.jobRoles.length - 2} more</span>}
                </div>

                <div className="company-footer">
                  <div className="company-date">
                    <Calendar size={13} />
                    <span>Visit: {new Date(company.visitDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                  <div className="company-branches">
                    {company.eligibility?.branches?.slice(0, 2).map(b => (
                      <span key={b} style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>{b}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3>No company drives found</h3>
            <p>Check back soon for upcoming placement drives</p>
          </div>
        )}
      </div>
    </div>
  );
}
