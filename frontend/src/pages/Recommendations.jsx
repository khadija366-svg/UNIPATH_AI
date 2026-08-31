import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { api } from '../services/api'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Loading } from '../components/ui/Loading'
import { EmptyState } from '../components/ui/EmptyState'

export default function Recommendations() {
  const navigate = useNavigate()
  const { profile, analysis, setAnalysis, loading, setLoading, isComplete } = useProfile()
  const [selected, setSelected] = useState([])

  useEffect(() => {
    if (!analysis && isComplete()) {
      setLoading(true)
      api.analyzeProfile(normalizeProfile(profile))
        .then((data) => setAnalysis(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [analysis, profile, isComplete, setAnalysis, setLoading])

  const recommendations = analysis?.recommendations || []

  const toggleCompare = (rec) => {
    setSelected((prev) => {
      const exists = prev.find((r) => r.program_id === rec.program_id)
      if (exists) return prev.filter((r) => r.program_id !== rec.program_id)
      if (prev.length >= 3) return prev
      return [...prev, rec]
    })
  }

  const goToCompare = () => {
    navigate('/compare', { state: { selections: selected } })
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Your Recommendations</h1>
        </div>
        <div className="empty-state"><Loading size={40} /></div>
      </div>
    )
  }

  if (!isComplete()) {
    return (
      <div className="page">
        <EmptyState
          icon="★"
          title="Complete your profile first"
          description="We need your academic details to generate recommendations."
          action={<button className="btn btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>}
        />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="page-title">Your Best Admission Paths</h1>
          <p className="page-subtitle">Ranked by UniPath Match Score based on your profile.</p>
        </div>
        {selected.length > 0 && (
          <button className="btn btn-primary" onClick={goToCompare}>
            Compare ({selected.length})
          </button>
        )}
      </div>

      {recommendations.length === 0 ? (
        <EmptyState
          icon="★"
          title="No recommendations yet"
          description="Try updating your profile or expanding your budget."
        />
      ) : (
        <div className="recommendation-list">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.program_id}
              rec={rec}
              selected={selected.some((r) => r.program_id === rec.program_id)}
              onToggle={() => toggleCompare(rec)}
            />
          ))}
        </div>
      )}

      <style>{`
        .recommendation-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .rec-card {
          background: var(--surface);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
        }
        .rec-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-md);
        }
        .rec-card-title {
          font-size: var(--text-lg);
          font-weight: 700;
        }
        .rec-card-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .rec-card-score {
          text-align: right;
        }
        .rec-card-score-value {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--accent-dark);
        }
        .rec-card-score-label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .rec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--space-md);
          margin: var(--space-lg) 0;
        }
        .rec-grid-item {
          background: var(--surface-soft);
          border-radius: var(--radius-md);
          padding: var(--space-md);
        }
        .rec-grid-label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .rec-grid-value {
          font-size: var(--text-sm);
          font-weight: 700;
          margin-top: 4px;
        }
        .rec-why {
          margin-top: var(--space-md);
        }
        .rec-why-title {
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: var(--space-sm);
        }
        .rec-why-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        .rec-why-item {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .rec-breakdown {
          margin-top: var(--space-md);
          padding: var(--space-md);
          background: var(--surface-soft);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
        }
        .rec-breakdown-title {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .rec-breakdown-items {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-md);
        }
        .rec-breakdown-chip {
          display: inline-flex;
          gap: 4px;
        }
        .rec-source {
          margin-top: var(--space-md);
          padding-top: var(--space-md);
          border-top: 1px solid var(--border);
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .rec-actions {
          display: flex;
          gap: var(--space-sm);
          margin-top: var(--space-md);
        }
      `}</style>
    </div>
  )
}

function RecommendationCard({ rec, selected, onToggle }) {
  const matchVariant = rec.match_score >= 90 ? 'success' : rec.match_score >= 75 ? 'success' : rec.match_score >= 60 ? 'warning' : 'neutral'

  return (
    <div className="rec-card">
      <div className="rec-card-header">
        <div>
          <div className="rec-card-title">{rec.university}</div>
          <div className="rec-card-subtitle">{rec.program}</div>
        </div>
        <div className="rec-card-score">
          <div className="rec-card-score-value">{Math.round(rec.match_score)}%</div>
          <div className="rec-card-score-label">Match</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <Badge variant={matchVariant}>{rec.category}</Badge>
        <Badge variant={rec.eligibility?.status === 'ELIGIBLE' ? 'success' : rec.eligibility?.status === 'BORDERLINE' ? 'warning' : 'neutral'}>
          {rec.eligibility?.status || 'Unknown'}
        </Badge>
        <Badge variant={rec.budget_status === 'WITHIN_BUDGET' ? 'success' : rec.budget_status === 'ABOVE_BUDGET' ? 'danger' : 'neutral'}>
          {rec.budget_status || 'Unknown'}
        </Badge>
      </div>

      <div className="rec-grid">
        <div className="rec-grid-item">
          <div className="rec-grid-label">Merit</div>
          <div className="rec-grid-value">{rec.merit ? `${rec.merit}%` : 'Unknown'}</div>
        </div>
        <div className="rec-grid-item">
          <div className="rec-grid-label">Test</div>
          <div className="rec-grid-value">{rec.test_detail || rec.test_status || 'Not Required'}</div>
        </div>
        <div className="rec-grid-item">
          <div className="rec-grid-label">Fee (Semester)</div>
          <div className="rec-grid-value">{rec.fee ? `PKR ${Number(rec.fee).toLocaleString()}` : 'Unknown'}</div>
        </div>
        <div className="rec-grid-item">
          <div className="rec-grid-label">Deadline</div>
          <div className="rec-grid-value">{rec.deadline_status || 'Unknown'}</div>
        </div>
        <div className="rec-grid-item">
          <div className="rec-grid-label">Program Match</div>
          <div className="rec-grid-value">{rec.program_match || '—'}</div>
        </div>
        <div className="rec-grid-item">
          <div className="rec-grid-label">Confidence</div>
          <div className="rec-grid-value">{rec.confidence || 'Medium'}</div>
        </div>
      </div>

      {rec.merit_breakdown && rec.merit_breakdown.length > 0 && (
        <div className="rec-breakdown">
          <div className="rec-breakdown-title">Merit Breakdown ({rec.merit}%)</div>
          <div className="rec-breakdown-items">
            {rec.merit_breakdown.map((item, idx) => (
              <span key={idx} className="rec-breakdown-chip">
                <strong>{item.component}:</strong> {item.value}% × {Math.round(item.weight * 100)}% = <strong>{item.contribution}%</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rec-why">
        <div className="rec-why-title">Why this match?</div>
        <ul className="rec-why-list">
          {(rec.reasons || []).slice(0, 5).map((reason, index) => (
            <li key={index} className="rec-why-item">
              <span>✓</span> {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="rec-source">
        Source: {rec.source?.type || 'University data'} • Verified: {rec.source?.verified_at || '2026 session'}
      </div>

      <div className="rec-actions">
        <button className={`btn ${selected ? 'btn-primary' : 'btn-secondary'}`} onClick={onToggle}>
          {selected ? 'Selected for Compare' : 'Add to Compare'}
        </button>
      </div>
    </div>
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
