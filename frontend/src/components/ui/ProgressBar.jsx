export function ProgressBar({ value, max = 100, variant = 'default', className = '' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const fillClass =
    variant === 'purple' ? 'progress-fill-purple' :
    variant === 'dark' ? 'progress-fill-dark' :
    variant === 'gradient' ? 'progress-fill-gradient' :
    'progress-fill'

  return (
    <div className={`progress-bar ${className}`}>
      <div className={fillClass} style={{ width: `${percentage}%` }} />
    </div>
  )
}
