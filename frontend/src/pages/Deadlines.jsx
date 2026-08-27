import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Loading } from '../components/ui/Loading'
import { api } from '../services/api'

export default function Deadlines() {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDeadlines()
      .then((data) => setDeadlines(data.deadlines || []))
      .catch(() => setDeadlines([]))
      .finally(() => setLoading(false))
  }, [])

  const groups = {
    CLOSING_SOON: deadlines.filter((d) => d.status === 'CLOSING_SOON'),
    OPEN: deadlines.filter((d) => d.status === 'OPEN'),
    CLOSED: deadlines.filter((d) => d.status === 'CLOSED'),
    UNKNOWN: deadlines.filter((d) => d.status === 'UNKNOWN'),
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Application Deadlines</h1>
        </div>
        <div className="empty-state"><Loading size={40} /></div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Application Deadlines</h1>
        <p className="page-subtitle">Track admission deadlines across universities.</p>
      </div>

      <div className="dashboard-grid">
        <DeadlineGroup title="Closing Soon" icon="🔥" items={groups.CLOSING_SOON} variant="warning" />
        <DeadlineGroup title="Open" icon="✓" items={groups.OPEN} variant="success" />
        <DeadlineGroup title="Closed" icon="✗" items={groups.CLOSED} variant="danger" />
        <DeadlineGroup title="Unknown" icon="?" items={groups.UNKNOWN} variant="neutral" />
      </div>

      <style>{`
        .deadline-group {
          grid-column: span 6;
        }
        .deadline-group-card {
          background: var(--surface);
          border-radius: var(--radius-xl);
          padding: var(--space-lg);
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
        }
        .deadline-group-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }
        .deadline-group-title {
          font-size: var(--text-md);
          font-weight: 700;
        }
        .deadline-group-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .deadline-group-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md);
          background: var(--surface-soft);
          border-radius: var(--radius-md);
        }
        .deadline-group-item-info {
          display: flex;
          flex-direction: column;
        }
        .deadline-group-item-title {
          font-size: var(--text-sm);
          font-weight: 700;
        }
        .deadline-group-item-subtitle {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .deadline-group-item-days {
          font-size: var(--text-xs);
          font-weight: 700;
          white-space: nowrap;
        }
        @media (max-width: 1100px) {
          .deadline-group {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  )
}

function DeadlineGroup({ title, icon, items, variant }) {
  return (
    <div className="deadline-group">
      <div className="deadline-group-card">
        <div className="deadline-group-header">
          <span>{icon}</span>
          <div className="deadline-group-title">{title}</div>
          <Badge variant={variant} style={{ marginLeft: 'auto' }}>{items.length}</Badge>
        </div>
        <div className="deadline-group-list">
          {items.length === 0 ? (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-md)', textAlign: 'center' }}>
              No deadlines in this category.
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="deadline-group-item">
                <div className="deadline-group-item-info">
                  <span className="deadline-group-item-title">{item.university}</span>
                  <span className="deadline-group-item-subtitle">{item.program} • {formatDate(item.date)}</span>
                </div>
                <span className="deadline-group-item-days" style={{ color: `var(--status-${variant === 'warning' ? 'closing' : variant === 'success' ? 'open' : variant === 'danger' ? 'closed' : 'secondary'})` }}>
                  {item.days_remaining != null ? `${item.days_remaining} days` : item.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
