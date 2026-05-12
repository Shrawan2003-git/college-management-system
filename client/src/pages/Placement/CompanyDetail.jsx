import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, Briefcase, GraduationCap, CheckCircle, Users } from 'lucide-react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import './Placement.css';

export default function CompanyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    API.get(`/api/placement/companies/${id}`)
      .then(({ data }) => {
        setCompany(data.company);
        if (user) {
          setApplied(data.company.applicants?.some(a => (a._id || a) === user._id));
        }
      })
      .catch(() => { toast.error('Company not found'); navigate('/placement'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') return toast.error('Only students can apply');
    setApplying(true);
    try {
      await API.post(`/api/placement/companies/${id}/apply`);
      setApplied(true);
      toast.success('Application submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  if (loading) return <Loader />;
  if (!company) return null;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate('/placement')}>
          <ArrowLeft size={16} /> Back to Placements
        </button>

        <div className="company-detail-grid">
          {/* Main */}
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="company-detail-header">
                <div className="company-logo-lg">
                  {company.logo ? <img src={company.logo} alt={company.name} /> : <span>🏢</span>}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span className={`badge badge-${company.status}`}>{company.status}</span>
                  </div>
                  <h2>{company.name}</h2>
                  <div className="company-package" style={{ marginTop: 8 }}>
                    <Briefcase size={16} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary)' }}>{company.package}</span>
                  </div>
                </div>
              </div>
              <div className="divider" />
              <p style={{ lineHeight: 1.8 }}>{company.description}</p>
            </div>

            {/* Drive Stages */}
            {company.driveStages?.length > 0 && (
              <div className="card">
                <h4 style={{ marginBottom: 20 }}>Selection Process</h4>
                <div className="timeline">
                  {company.driveStages.map((stage, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" />
                      <div>
                        <div style={{ fontWeight: 600 }}>Round {i + 1}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 20 }}>Drive Details</h4>
              <div className="event-info-list">
                <div className="event-info-item">
                  <Calendar size={16} className="info-icon" />
                  <div>
                    <div className="info-label">Company Visit</div>
                    <div className="info-value">{new Date(company.visitDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
                  </div>
                </div>
                <div className="event-info-item">
                  <Calendar size={16} className="info-icon" />
                  <div>
                    <div className="info-label">Application Deadline</div>
                    <div className="info-value">{new Date(company.applicationDeadline).toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
                  </div>
                </div>
                <div className="event-info-item">
                  <Users size={16} className="info-icon" />
                  <div>
                    <div className="info-label">Total Applicants</div>
                    <div className="info-value">{company.applicants?.length || 0} students</div>
                  </div>
                </div>
              </div>

              {/* Eligibility */}
              <div style={{ marginTop: 20 }}>
                <h5 style={{ marginBottom: 12 }}>Eligibility Criteria</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="elig-item"><CheckCircle size={14} /><span>Min CGPA: {company.eligibility?.minCGPA}</span></div>
                  <div className="elig-item"><CheckCircle size={14} /><span>Max Backlogs: {company.eligibility?.maxBacklogs}</span></div>
                  <div className="elig-item"><GraduationCap size={14} /><span>Branches: {company.eligibility?.branches?.join(', ')}</span></div>
                  <div className="elig-item"><GraduationCap size={14} /><span>Years: {company.eligibility?.years?.map(y => `Year ${y}`).join(', ')}</span></div>
                </div>
              </div>

              {/* Job Roles */}
              {company.jobRoles?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h5 style={{ marginBottom: 10 }}>Job Roles</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {company.jobRoles.map(r => <span key={r} className="tag-chip">{r}</span>)}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                {applied ? (
                  <div className="alert alert-success"><CheckCircle size={16} /> Application submitted!</div>
                ) : company.status === 'completed' ? (
                  <div className="alert alert-warning">This drive has been completed</div>
                ) : !user ? (
                  <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/login')}>Login to Apply</button>
                ) : user.role === 'student' ? (
                  <button className="btn btn-primary btn-full btn-lg" onClick={handleApply} disabled={applying}>
                    {applying ? 'Submitting...' : '🚀 Apply for This Drive'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
