import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { api } from '../services/api'
import { Loading } from '../components/ui/Loading'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { SegmentedBar } from '../components/ui/SegmentedBar'

export default function Analytics() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isComplete(profile)) {
      setLoading(true)
      api.getAnalytics(normalizeProfile(profile))
        .then((data) => setAnalytics(data))
        .finally(() => setLoading(false))
    }
  }, [profile])

  if (!isComplete(profile)) {
    return (
      <div className="page">
        <EmptyState
          icon="◧"
          title="Complete your profile"
          description="Analytics are generated from your profile and real university data."
          action={<button className="btn btn-primary" onClick={() => navigate('/profile')}>Build Profile</button>}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
        </div>
        <div className="empty-state"><Loading size={40} /></div>
      </div>
    )
  }

  const eligibilitySegments = analytics?.eligibility_distribution
    ? Object.entries(analytics.eligibility_distribution).map(([label, value]) => ({
        label,
        value,
        color: label === 'ELIGIBLE' ? '#7DA865' : label === 'BORDERLINE' ? '#D4A855' : '#C4A8D4',
      }))
    : []

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Insights from your admission landscape.</p>
      </div>

      <div className="dashboard-grid">
        <div className="col-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Eligibility Status</div>
            </div>
            <SegmentedBar segments={eligibilitySegments} />
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
              {eligibilitySegments.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                  {s.label} ({s.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Deadline Urgency</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {(analytics?.deadline_urgency || []).map((item) => (
                <div key={item.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                    <span>{item.status}</span>
                    <span>{item.count}</span>
                  </div>
                  <ProgressBar value={item.count} max={analytics?.total_programs || 10} variant="gradient" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Fee Comparison</div>
            </div>
            <div className="analytics-bars">
              {(analytics?.fee_comparison || []).map((item) => (
                <div key={item.program_id} className="analytics-bar-row">
                  <div className="analytics-bar-label">{item.university}<br /><span>{item.program}</span></div>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{ width: `${Math.min(100, (item.fee / (analytics?.max_fee || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="analytics-bar-value">PKR {Number(item.fee).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Program Availability</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              {(analytics?.program_counts || []).map((item) => (
                <div key={item.program} style={{ background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{item.count}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{item.program}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Test Requirements</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {(analytics?.test_requirements || []).map((item) => (
                <div key={item.test} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md)', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 700 }}>{item.test || 'No Test'}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{item.count} programs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .analytics-bar-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .analytics-bar-label {
          width: 160px;
          font-size: var(--text-sm);
          font-weight: 700;
        }
        .analytics-bar-label span {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          font-weight: 500;
        }
        .analytics-bar-track {
          flex: 1;
          height: 12px;
          background: var(--surface-soft);
          border-radius: var(--radius-pill);
          overflow: hidden;
        }
        .analytics-bar-fill {
          height: 100%;
          border-radius: var(--radius-pill);
          background: linear-gradient(90deg, var(--accent), var(--accent-light));
          transition: width var(--transition-slow);
        }
        .analytics-bar-value {
          width: 120px;
          text-align: right;
          font-size: var(--text-xs);
          font-weight: 700;
        }
      `}</style>
    </div>
  )
}

function isComplete(profile) {
  return (
    profile.name &&
    profile.matric_percentage !== '' &&
    profile.intermediate_percentage !== '' &&
    profile.qualification &&
    profile.preferred_program &&
    profile.budget !== ''
  )
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
