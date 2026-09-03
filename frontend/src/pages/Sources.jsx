import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Badge } from '../components/ui/Badge'
import { Loading } from '../components/ui/Loading'

export default function Sources() {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getUniversities()
      .then((data) => setUniversities(data.universities || []))
      .catch(() => setUniversities([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Sources & Methodology</h1>
        </div>
        <div className="empty-state"><Loading size={40} /></div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Sources & Methodology</h1>
        <p className="page-subtitle">How UniPath AI gathers and validates admission information.</p>
      </div>

      <div className="dashboard-grid">
        <div className="col-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Data Source Priority</div>
            </div>
            <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <li>Official university admission page</li>
              <li>Official university prospectus</li>
              <li>Official admissions portal</li>
              <li>Previously verified official cached data</li>
            </ol>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Confidence Levels</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ padding: 'var(--space-md)', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
                <strong>HIGH</strong> — Verified from official source during current session.
              </div>
              <div style={{ padding: 'var(--space-md)', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
                <strong>MEDIUM</strong> — From official source but not recently verified.
              </div>
              <div style={{ padding: 'var(--space-md)', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
                <strong>LOW / UNKNOWN</strong> — Insufficient verified information.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">University Sources</div>
            </div>
            <div className="sources-table-wrapper">
              <table className="sources-table">
                <thead>
                  <tr>
                    <th>University</th>
                    <th>Campus</th>
                    <th>Source Type</th>
                    <th>Data Source</th>
                    <th>Session</th>
                    <th>Confidence</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {universities.map((u) => (
                    <tr key={u.university_id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.campus}</td>
                      <td>{u.source?.type || 'CACHED'}</td>
                      <td><Badge variant={u.source?.data_source === 'live' ? 'success' : 'neutral'}>{u.source?.data_source === 'live' ? 'LIVE' : 'CACHE'}</Badge></td>
                      <td>{u.admission_cycle}</td>
                      <td><Badge variant={u.source?.confidence === 'HIGH' ? 'success' : 'neutral'}>{u.source?.confidence || 'MEDIUM'}</Badge></td>
                      <td>{u.source?.verified_at || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Methodology</div>
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              <section>
                <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>Eligibility Engine</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Compares your academic record, qualification, subjects, and test scores against each program's official requirements. Missing data is reported as INFORMATION_MISSING, not assumed.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>Merit Engine</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Applies the university's published merit formula to your scores. If no official formula is available, merit is reported as UNKNOWN.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>Recommendation Engine</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Combines academic fit, program match, budget fit, deadline urgency, and preference. The UniPath Match Score is NOT an admission probability.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>AI Limitations</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  The AI counselor explains deterministic results and answers questions using verified context. It never invents admission criteria, fees, deadlines, or probabilities.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sources-table-wrapper {
          overflow-x: auto;
        }
        .sources-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        .sources-table th,
        .sources-table td {
          padding: var(--space-md);
          text-align: left;
          border-bottom: 1px solid var(--border);
          font-size: var(--text-sm);
        }
        .sources-table th {
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: var(--text-xs);
        }
      `}</style>
    </div>
  )
}
