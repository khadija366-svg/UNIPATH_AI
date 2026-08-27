import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Loading } from '../components/ui/Loading'
import { EmptyState } from '../components/ui/EmptyState'
import { api } from '../services/api'

const filters = {
  program: ['', 'Computer Science', 'Software Engineering', 'Electrical Engineering', 'Business Administration'],
  city: ['', 'Lahore', 'Islamabad', 'Rawalpindi'],
  test_required: ['', 'true', 'false'],
}

export default function Universities() {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ program: '', city: '', test_required: '' })

  useEffect(() => {
    loadUniversities()
  }, [filter])

  const loadUniversities = async () => {
    setLoading(true)
    try {
      const data = await api.getUniversities(filter)
      setUniversities(data.universities || [])
    } catch {
      setUniversities([])
    } finally {
      setLoading(false)
    }
  }

  const allPrograms = universities.flatMap((u) => u.programs || [])
  const filteredPrograms = filter.program
    ? allPrograms.filter((p) => p.normalized_name === normalizeName(filter.program))
    : allPrograms

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Explore Universities</h1>
        <p className="page-subtitle">Browse verified programs and admission requirements.</p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="filter-bar">
          <div className="filter-group">
            <label>Program</label>
            <select
              className="select"
              value={filter.program}
              onChange={(e) => setFilter({ ...filter, program: e.target.value })}
            >
              {filters.program.map((p) => (
                <option key={p} value={p}>{p || 'All Programs'}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>City</label>
            <select
              className="select"
              value={filter.city}
              onChange={(e) => setFilter({ ...filter, city: e.target.value })}
            >
              {filters.city.map((c) => (
                <option key={c} value={c}>{c || 'All Cities'}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Test Required</label>
            <select
              className="select"
              value={filter.test_required}
              onChange={(e) => setFilter({ ...filter, test_required: e.target.value })}
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><Loading size={40} /></div>
      ) : filteredPrograms.length === 0 ? (
        <EmptyState
          icon="▣"
          title="No universities found"
          description="Try adjusting your filters."
        />
      ) : (
        <div className="university-grid">
          {filteredPrograms.map((program) => (
            <UniversityCard key={`${program.university_id}-${program.program_id}`} program={program} />
          ))}
        </div>
      )}

      <style>{`
        .filter-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--space-md);
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        .filter-group label {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .university-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-lg);
        }
        .university-card {
          background: var(--surface);
          border-radius: var(--radius-xl);
          padding: var(--space-lg);
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }
        .university-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        .university-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-md);
        }
        .university-card-title {
          font-size: var(--text-md);
          font-weight: 700;
        }
        .university-card-subtitle {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .university-card-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-sm);
          margin-top: var(--space-md);
        }
        .university-card-meta-item {
          background: var(--surface-soft);
          border-radius: var(--radius-sm);
          padding: var(--space-sm);
        }
        .university-card-meta-label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .university-card-meta-value {
          font-size: var(--text-sm);
          font-weight: 700;
        }
      `}</style>
    </div>
  )
}

function UniversityCard({ program }) {
  const fee = program.fees?.amount
    ? `PKR ${Number(program.fees.amount).toLocaleString()} / ${program.fees.period}`
    : 'Not verified'

  return (
    <div className="university-card">
      <div className="university-card-header">
        <div>
          <div className="university-card-title">{program.university_name}</div>
          <div className="university-card-subtitle">{program.campus} Campus</div>
        </div>
        <Badge variant={program.data_confidence === 'HIGH' ? 'success' : 'neutral'}>
          {program.data_confidence || 'CACHED'}
        </Badge>
      </div>

      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
        {program.name}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
        <Badge variant="neutral">{program.normalized_name}</Badge>
        {program.tests?.required ? (
          <Badge variant="warning">Test Required</Badge>
        ) : (
          <Badge variant="success">No Test</Badge>
        )}
      </div>

      <div className="university-card-meta">
        <div className="university-card-meta-item">
          <div className="university-card-meta-label">Fee</div>
          <div className="university-card-meta-value">{fee}</div>
        </div>
        <div className="university-card-meta-item">
          <div className="university-card-meta-label">Deadline</div>
          <div className="university-card-meta-value">{program.deadline_status || 'Unknown'}</div>
        </div>
        <div className="university-card-meta-item">
          <div className="university-card-meta-label">Min Inter</div>
          <div className="university-card-meta-value">
            {program.eligibility?.minimum_intermediate ? `${program.eligibility.minimum_intermediate}%` : '—'}
          </div>
        </div>
        <div className="university-card-meta-item">
          <div className="university-card-meta-label">Accepted Tests</div>
          <div className="university-card-meta-value">
            {program.tests?.accepted_tests?.length ? program.tests.accepted_tests.join(', ') : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}
