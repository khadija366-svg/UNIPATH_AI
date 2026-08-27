export function EmptyState({ icon = '⊘', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: 'var(--space-md)' }}>{action}</div>}
    </div>
  )
}
