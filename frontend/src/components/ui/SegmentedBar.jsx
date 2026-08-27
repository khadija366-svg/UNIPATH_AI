export function SegmentedBar({ segments, className = '' }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className={`segmented-bar ${className}`}>
      {segments.map((segment, index) => (
        <div
          key={index}
          className="segment"
          style={{
            flex: `${segment.value} 0 0`,
            background: segment.color,
          }}
          title={`${segment.label}: ${segment.value}`}
        />
      ))}
    </div>
  )
}
