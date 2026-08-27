const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
  dark: 'badge-dark',
}

export function Badge({ children, variant = 'neutral', className = '' }) {
  return <span className={`badge ${variants[variant] || variants.neutral} ${className}`}>{children}</span>
}
