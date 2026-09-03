import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircularProgress } from '../components/ui/CircularProgress'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { SegmentedBar } from '../components/ui/SegmentedBar'
import { Loading } from '../components/ui/Loading'
import { useProfile } from '../hooks/useProfile'
import { api } from '../services/api'

export default function Home() {
  const navigate = useNavigate()
  const { profile, isComplete, analysis, setAnalysis, loading, setLoading } = useProfile()
  const [health, setHealth] = useState(null)

  useEffect(() => {
    api.health().then(() => setHealth('ok')).catch(() => setHealth('error'))
  }, [])

  useEffect(() => {
    if (isComplete() && !analysis) {
      setLoading(true)
      api.analyzeProfile(normalizeProfile(profile))
        .then((data) => setAnalysis(data))
        .catch(() => setAnalysis(null))
        .finally(() => setLoading(false))
    }
  }, [profile, analysis, isComplete, setAnalysis, setLoading])

  const handleAnalyze = () => {
    navigate('/profile')
  }

  const recommendations = analysis?.recommendations || []
  const deadlines = analysis?.deadlines || []
  const stats = analysis?.stats || { matched: 0, eligible: 0, strong: 0, deadlines: 0 }
  const matchScore = recommendations[0]?.match_score || 0
  const matchLabel = matchScore >= 90 ? 'Excellent Match' : matchScore >= 75 ? 'Strong Match' : matchScore >= 60 ? 'Moderate Match' : 'Low Match'

  return (
    <div className="page">
      <div className="dashboard-grid">
        {/* Hero card: UniPath Match Score */}
        <div className="col-7">
          <div className="card-hero">
            <div className="card-header">
              <div>
                <div className="card-title">UniPath AI</div>
                <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginTop: 2 }}>
                  Your admission path, simplified.
                </div>
              </div>
              <button className="btn btn-ghost btn-sm">
                <span>Today</span>
                <span>▾</span>
              </button>
            </div>

            <div className="hero-body">
              <div className="hero-progress">
                <CircularProgress value={matchScore || 72} size={180} strokeWidth={10}>
                  <div className="hero-score">{matchScore ? `${Math.round(matchScore)}%` : '72%'}</div>
                  <div className="hero-score-label">UNIPATH MATCH</div>
                  <div className="hero-match-label">{matchScore ? matchLabel : 'Strong Match'}</div>
                </CircularProgress>
              </div>

              <div className="hero-actions">
                <button className="btn btn-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  ■
                </button>
                <button className="btn btn-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  ❚❚
                </button>
                <button
                  className="btn btn-icon"
                  style={{ background: 'rgba(32,37,27,0.85)', color: 'white', marginLeft: 'auto' }}
                  onClick={handleAnalyze}
                  title="Analyze my options"
                >
                  +
                </button>
              </div>

              <div className="hero-floating-badge">
                <span>Profile status</span>
                <span className="hero-floating-value">
                  {isComplete() ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            </div>

            <style>{`
              .hero-body {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: var(--space-lg) 0;
                position: relative;
              }
              .hero-score {
                font-size: var(--text-3xl);
                font-weight: 700;
                line-height: 1;
              }
              .hero-score-label {
                font-size: var(--text-xs);
                font-weight: 700;
                letter-spacing: 0.1em;
                margin-top: var(--space-xs);
                opacity: 0.9;
              }
              .hero-match-label {
                font-size: var(--text-sm);
                margin-top: 2px;
                opacity: 0.85;
              }
              .hero-actions {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                width: 100%;
                margin-top: var(--space-xl);
              }
              .hero-floating-badge {
                position: absolute;
                right: 0;
                bottom: var(--space-lg);
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border-radius: var(--radius-md);
                padding: var(--space-sm) var(--space-md);
                font-size: var(--text-xs);
                display: flex;
                flex-direction: column;
                gap: 2px;
              }
              .hero-floating-value {
                font-weight: 700;
                font-size: var(--text-sm);
              }
              @media (max-width: 640px) {
                .hero-floating-badge { display: none; }
              }
            `}</style>
          </div>
        </div>

        {/* University Options Chart */}
        <div className="col-5">
          <div className="card" style={{ minHeight: 340, display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title">University Options</div>
              <button className="btn btn-secondary btn-sm">
                <span>All Programs</span>
                <span>▾</span>
              </button>
            </div>

            <div className="options-chart" style={{ flex: 1 }}>
              {loading ? (
                <div className="empty-state"><Loading /></div>
              ) : recommendations.length > 0 ? (
                <UniversityOptionsChart recommendations={recommendations} />
              ) : (
                <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                  <div className="empty-state-icon">⊘</div>
                  <h3>No analysis yet</h3>
                  <p>Complete your profile to see university options.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Summary Card */}
        <div className="col-4">
          <div className="card" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
            <div className="profile-date">
              <div className="profile-date-month">NOW</div>
              <div className="profile-date-day">{new Date().getDate().toString().padStart(2, '0')}</div>
            </div>
            <div className="profile-mini">
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.06 }}>
                {isComplete() ? 'Ready to Apply' : 'Complete Profile'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                {profile.name || 'Student'}
              </div>
            </div>
            <div className="profile-avatar" style={{ marginLeft: 'auto' }}>
              <span>{(profile.name || 'S').slice(0, 2).toUpperCase()}</span>
            </div>
          </div>

          <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="card-header">
              <div className="card-title">Academic Profile</div>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-label">Project time</div>
                <div className="profile-stat-value">{profile.intermediate_percentage || 0}%</div>
              </div>
              <div className="profile-stat-bars">
                <div className="profile-stat-row">
                  <span>Matric</span>
                  <span>{profile.matric_percentage || 0}%</span>
                </div>
                <ProgressBar value={Number(profile.matric_percentage) || 0} variant="gradient" />
                <div className="profile-stat-row" style={{ marginTop: 'var(--space-sm)' }}>
                  <span>Inter</span>
                  <span>{profile.intermediate_percentage || 0}%</span>
                </div>
                <ProgressBar value={Number(profile.intermediate_percentage) || 0} variant="gradient" />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
              <Badge variant="neutral">{profile.qualification || '—'}</Badge>
              <Badge variant="dark">{profile.preferred_program || '—'}</Badge>
            </div>

            <style>{`
              .profile-date {
                width: 56px;
                height: 56px;
                border-radius: var(--radius-md);
                background: var(--surface-soft);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }
              .profile-date-month {
                font-size: var(--text-xs);
                font-weight: 700;
                color: var(--text-secondary);
              }
              .profile-date-day {
                font-size: var(--text-xl);
                font-weight: 700;
                color: var(--text-primary);
              }
              .profile-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: var(--surface-soft);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--text-sm);
                font-weight: 700;
                color: var(--accent-dark);
              }
              .profile-stats {
                display: flex;
                gap: var(--space-lg);
                align-items: center;
              }
              .profile-stat {
                display: flex;
                flex-direction: column;
              }
              .profile-stat-label {
                font-size: var(--text-xs);
                color: var(--text-secondary);
              }
              .profile-stat-value {
                font-size: var(--text-2xl);
                font-weight: 700;
              }
              .profile-stat-bars {
                flex: 1;
              }
              .profile-stat-row {
                display: flex;
                justify-content: space-between;
                font-size: var(--text-xs);
                color: var(--text-secondary);
                margin-bottom: 4px;
              }
            `}</style>
          </div>
        </div>

        {/* Application Deadlines Card */}
        <div className="col-8">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Application Deadlines</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Upcoming admissions closing soon
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{deadlines.length || 2}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/deadlines')}>
                  + Add deadline
                </button>
              </div>
            </div>

            {loading ? (
              <div className="empty-state"><Loading /></div>
            ) : deadlines.length > 0 ? (
              <div className="deadlines-list">
                {deadlines.slice(0, 3).map((deadline, index) => (
                  <div key={index} className="deadline-item">
                    <div className="deadline-time">{formatDate(deadline.date)}</div>
                    <div className="deadline-info">
                      <div className="deadline-title">{deadline.university}</div>
                      <div className="deadline-subtitle">{deadline.program}</div>
                    </div>
                    <div className="deadline-avatars">
                      <span className="avatar avatar-sm" style={{ background: 'var(--accent)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)' }}>
                        {deadline.urgency === 'CLOSING_SOON' ? '!' : '✓'}
                      </span>
                    </div>
                    <div className="deadline-privacy">
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {deadline.status}
                      </span>
                      <input type="checkbox" className="toggle" defaultChecked={deadline.status === 'OPEN'} readOnly />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="deadlines-list">
                <DeadlineItem time="09:20" title="FAST" subtitle="BSCS — Closing in 3 days" status="OPEN" />
                <DeadlineItem time="11:00" title="ITU Lahore" subtitle="BSCS — Check official deadline" status="OPEN" />
              </div>
            )}

            <style>{`
              .deadlines-list {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
              }
              .deadline-item {
                display: flex;
                align-items: center;
                gap: var(--space-md);
                padding: var(--space-md);
                border-radius: var(--radius-md);
                background: var(--surface-soft);
              }
              .deadline-time {
                font-size: var(--text-lg);
                font-weight: 700;
                min-width: 64px;
              }
              .deadline-info {
                flex: 1;
              }
              .deadline-title {
                font-size: var(--text-sm);
                font-weight: 700;
              }
              .deadline-subtitle {
                font-size: var(--text-xs);
                color: var(--text-secondary);
              }
              .deadline-privacy {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-grid" style={{ marginTop: 'var(--space-lg)' }}>
        <QuickStat label="Universities Matched" value={stats.matched} icon="▣" />
        <QuickStat label="Eligible Programs" value={stats.eligible} icon="✓" />
        <QuickStat label="Strong Matches" value={stats.strong} icon="★" />
        <QuickStat label="Upcoming Deadlines" value={stats.deadlines} icon="◷" />
      </div>
    </div>
  )
}

function QuickStat({ label, value, icon }) {
  return (
    <div className="col-3">
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--surface-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-lg)',
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{label}</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{value}</div>
        </div>
      </div>
    </div>
  )
}

function DeadlineItem({ time, title, subtitle, status }) {
  return (
    <div className="deadline-item">
      <div className="deadline-time">{time}</div>
      <div className="deadline-info">
        <div className="deadline-title">{title}</div>
        <div className="deadline-subtitle">{subtitle}</div>
      </div>
      <div className="deadline-privacy">
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{status}</span>
        <input type="checkbox" className="toggle" defaultChecked={status === 'OPEN'} readOnly />
      </div>
    </div>
  )
}

function UniversityOptionsChart({ recommendations }) {
  const categories = [
    { label: 'Excellent', color: '#6F8D54', threshold: 90 },
    { label: 'Strong', color: '#A7C77B', threshold: 75 },
    { label: 'Moderate', color: '#D4A855', threshold: 60 },
    { label: 'Low', color: '#C4A8D4', threshold: 0 },
  ]

  const counts = categories.map((cat) => ({
    ...cat,
    value: recommendations.filter((r) => r.match_score >= cat.threshold).length,
  }))

  const chartData = recommendations.slice(0, 5).map((r) => ({
    name: r.university.split(' ')[0],
    score: r.match_score,
    program: r.program,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', height: '100%' }}>
      <div className="mini-gantt">
        {chartData.map((item, index) => (
          <div key={index} className="mini-gantt-row">
            <div className="mini-gantt-label">{item.name}</div>
            <div className="mini-gantt-bar-track">
              <div
                className="mini-gantt-bar"
                style={{
                  width: `${item.score}%`,
                  background: index % 2 === 0
                    ? 'linear-gradient(90deg, #8FAE70, #A7C77B)'
                    : 'linear-gradient(90deg, #C4A8D4, #DCC8E8)',
                }}
              />
            </div>
            <div className="mini-gantt-score">{Math.round(item.score)}%</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
          Match distribution
        </div>
        <SegmentedBar segments={counts} />
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
          {counts.filter(c => c.value > 0).map((cat) => (
            <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
              {cat.label} ({cat.value})
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .mini-gantt {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          flex: 1;
          justify-content: center;
        }
        .mini-gantt-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .mini-gantt-label {
          width: 72px;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-secondary);
        }
        .mini-gantt-bar-track {
          flex: 1;
          height: 14px;
          background: var(--surface-soft);
          border-radius: var(--radius-pill);
          overflow: hidden;
        }
        .mini-gantt-bar {
          height: 100%;
          border-radius: var(--radius-pill);
          transition: width var(--transition-slow);
        }
        .mini-gantt-score {
          width: 36px;
          text-align: right;
          font-size: var(--text-xs);
          font-weight: 700;
        }
      `}</style>
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

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
