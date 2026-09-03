import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { api } from '../services/api'
import { Loading } from '../components/ui/Loading'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'

export default function Compare() {
  const navigate = useNavigate()
  const { profile, compareSelections } = useProfile()
  const selections = compareSelections
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (selections.length > 0) {
      setLoading(true)
      setError(null)
      api.comparePrograms({
        profile: normalizeProfile(profile),
        selections: selections.map((s) => ({ university_id: s.university_id, program_id: s.program_id })),
      })
        .then((data) => setComparison(data))
        .catch((err) => setError(err.message || 'Failed to load comparison.'))
        .finally(() => setLoading(false))
    }
  }, [selections, profile, retryCount])

  const rows = [
    { label: 'Eligibility', key: 'eligibility_status' },
    { label: 'Merit', key: 'merit' },
    { label: 'Test Requirement', key: 'test_status' },
    { label: 'Annual Fee', key: 'fee' },
    { label: 'Deadline', key: 'deadline_status' },
    { label: 'Program Match', key: 'program_match' },
    { label: 'UniPath Match', key: 'match_score' },
    { label: 'Confidence', key: 'confidence' },
  ]

  if (selections.length === 0) {
    return (
      <div className="page">
        <EmptyState
          icon="☰"
          title="Nothing to compare"
          description="Select programs from Recommendations to compare them side by side."
          action={<button className="btn btn-primary" onClick={() => navigate('/recommendations')}>Browse Recommendations</button>}
        />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Compare Programs</h1>
        <p className="page-subtitle">Side-by-side comparison of your selected options.</p>
      </div>

      {loading ? (
        <div className="empty-state"><Loading size={40} /></div>
      ) : error ? (
        <EmptyState
          icon="⚠"
          title="Couldn't load comparison"
          description={error}
          action={<button className="btn btn-primary" onClick={() => setRetryCount((n) => n + 1)}>Retry</button>}
        />
      ) : (
        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Criteria</th>
                {comparison?.items.map((item) => (
                  <th key={item.program_id}>
                    <div>{item.university}</div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)' }}>{item.program}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="compare-label">{row.label}</td>
                  {comparison?.items.map((item) => (
                    <td key={item.program_id}>
                      <CompareValue value={item[row.key]} label={row.label} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="compare-label">Why</td>
                {comparison?.items.map((item) => (
                  <td key={item.program_id}>
                    <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: 14 }}>
                      {(item.reasons || []).slice(0, 3).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .compare-table-wrapper {
          overflow-x: auto;
          background: var(--surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
        }
        .compare-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        .compare-table th,
        .compare-table td {
          padding: var(--space-md);
          text-align: left;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        .compare-table th {
          font-size: var(--text-sm);
          font-weight: 700;
          background: var(--surface-soft);
        }
        .compare-label {
          font-size: var(--text-xs);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .compare-table tr:last-child td {
          border-bottom: none;
        }
      `}</style>
    </div>
  )
}

function CompareValue({ value, label }) {
  if (label === 'UniPath Match' || label === 'Merit') {
    return <span style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>{value ? `${Math.round(value)}%` : '—'}</span>
  }
  if (label === 'Annual Fee') {
    return <span>{value ? `PKR ${Number(value).toLocaleString()}` : 'Unknown'}</span>
  }
  if (label === 'Eligibility' || label === 'Program Match') {
    return <Badge variant={value === 'ELIGIBLE' || value === 'EXACT_MATCH' ? 'success' : 'neutral'}>{value || '—'}</Badge>
  }
  return <span>{value || '—'}</span>
}

function normalizeProfile(profile) {
  return {
    ...profile,
    matric_percentage: Number(profile.matric_percentage) || 0,
    intermediate_percentage: Number(profile.intermediate_percentage) || 0,
    budget: Number(profile.budget) || 0,
    tests: profile.tests || [],
  }
}
