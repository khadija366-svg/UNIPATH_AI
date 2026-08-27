import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { api } from '../services/api'
import { Loading } from '../components/ui/Loading'
import { TEST_OPTIONS, getTestTotal, isKnownTest } from '../config/tests'

const steps = [
  { id: 'personal', label: 'Personal' },
  { id: 'academic', label: 'Academic' },
  { id: 'tests', label: 'Tests' },
  { id: 'program', label: 'Program' },
  { id: 'budget', label: 'Budget' },
  { id: 'review', label: 'Review' },
]

const qualifications = [
  'FSc Pre-Engineering',
  'FSc Pre-Medical',
  'ICS',
  'A-Level',
  'FA',
  'Diploma',
]

const programs = [
  'Computer Science',
  'Software Engineering',
  'Artificial Intelligence',
  'Data Science',
  'Electrical Engineering',
  'Business Administration',
  'Mechanical Engineering',
  'Civil Engineering',
  'Pharmacy',
  'Psychology',
]

const testOptions = TEST_OPTIONS

export default function Profile() {
  const navigate = useNavigate()
  const { profile, updateProfile, setAnalysis } = useProfile()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateStep = () => {
    const newErrors = {}
    const current = steps[step].id

    if (current === 'personal' && !profile.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (current === 'academic') {
      const matric = Number(profile.matric_percentage)
      const inter = Number(profile.intermediate_percentage)
      if (profile.matric_percentage === '' || matric < 0 || matric > 100) {
        newErrors.matric_percentage = 'Enter a value between 0 and 100'
      }
      if (profile.intermediate_percentage === '' || inter < 0 || inter > 100) {
        newErrors.intermediate_percentage = 'Enter a value between 0 and 100'
      }
      if (!profile.qualification) {
        newErrors.qualification = 'Select a qualification'
      }
    }
    if (current === 'program' && !profile.preferred_program) {
      newErrors.preferred_program = 'Select a preferred program'
    }
    if (current === 'budget') {
      const budget = Number(profile.budget)
      if (profile.budget === '' || budget < 0) {
        newErrors.budget = 'Enter a valid budget'
      }
    }

    if (current === 'tests') {
      profile.tests.forEach((test, index) => {
        const score = test.score === '' ? NaN : Number(test.score)
        const total = test.total === '' ? NaN : Number(test.total)
        if (Number.isNaN(score) || score < 0) {
          newErrors[`test_${index}_score`] = 'Enter a valid score'
        }
        if (Number.isNaN(total) || total <= 0) {
          newErrors[`test_${index}_total`] = 'Enter a valid total'
        }
        if (!Number.isNaN(score) && !Number.isNaN(total)) {
          if (score > total) {
            newErrors[`test_${index}_score`] = 'Score cannot exceed total marks'
          }
          const expected = getTestTotal(test.name)
          if (expected !== null && total !== expected) {
            newErrors[`test_${index}_total`] = `${test.name} total must be ${expected}`
          }
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (!validateStep()) return
    if (step < steps.length - 1) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleAnalyze = async () => {
    if (!validateStep()) return
    setLoading(true)
    try {
      const normalized = {
        ...profile,
        matric_percentage: Number(profile.matric_percentage),
        intermediate_percentage: Number(profile.intermediate_percentage),
        budget: Number(profile.budget),
        tests: (profile.tests || []).map((t) => ({
          name: t.name,
          score: Number(t.score),
          total: Number(t.total),
        })),
      }
      const data = await api.analyzeProfile(normalized)
      setAnalysis(data)
      navigate('/recommendations')
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  const addTest = () => {
    updateProfile({
      tests: [...profile.tests, { name: 'NAT', score: '', total: getTestTotal('NAT') }],
    })
  }

  const updateTest = (index, field, value) => {
    const tests = [...profile.tests]
    const test = { ...tests[index], [field]: value }
    if (field === 'name') {
      const expected = getTestTotal(value)
      if (expected !== null) {
        test.total = expected
      }
    }
    tests[index] = test
    updateProfile({ tests })
  }

  const removeTest = (index) => {
    const tests = profile.tests.filter((_, i) => i !== index)
    updateProfile({ tests })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Student Profile</h1>
        <p className="page-subtitle">Tell us about yourself to find the best admission paths.</p>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Stepper */}
        <div className="stepper">
          {steps.map((s, index) => (
            <div
              key={s.id}
              className={`step ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
            >
              <div className="step-circle">{index < step ? '✓' : index + 1}</div>
              <div className="step-label">{s.label}</div>
              {index < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="step-content">
          {steps[step].id === 'personal' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                className={`input ${errors.name ? 'input-error' : ''}`}
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                placeholder="e.g. Ayesha Khan"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          {steps[step].id === 'academic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div className="input-group">
                <label className="input-label">Matric Percentage</label>
                <input
                  type="number"
                  className={`input ${errors.matric_percentage ? 'input-error' : ''}`}
                  value={profile.matric_percentage}
                  onChange={(e) => updateProfile({ matric_percentage: e.target.value })}
                  placeholder="0 - 100"
                />
                {errors.matric_percentage && <span className="error-message">{errors.matric_percentage}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Intermediate Percentage</label>
                <input
                  type="number"
                  className={`input ${errors.intermediate_percentage ? 'input-error' : ''}`}
                  value={profile.intermediate_percentage}
                  onChange={(e) => updateProfile({ intermediate_percentage: e.target.value })}
                  placeholder="0 - 100"
                />
                {errors.intermediate_percentage && <span className="error-message">{errors.intermediate_percentage}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Qualification / Group</label>
                <select
                  className={`select ${errors.qualification ? 'input-error' : ''}`}
                  value={profile.qualification}
                  onChange={(e) => updateProfile({ qualification: e.target.value })}
                >
                  <option value="">Select qualification</option>
                  {qualifications.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                {errors.qualification && <span className="error-message">{errors.qualification}</span>}
              </div>
            </div>
          )}

          {steps[step].id === 'tests' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', fontSize: 'var(--text-sm)' }}>
                Add any entry tests you have taken. You can skip this step if not applicable.
              </p>
              {profile.tests.map((test, index) => (
                <div key={index} className="test-row-wrapper">
                  <div className="input-label" style={{ marginBottom: 4 }}>{test.name} Score</div>
                  <div className="test-row">
                    <select
                      className="select"
                      value={test.name}
                      onChange={(e) => updateTest(index, 'name', e.target.value)}
                    >
                      {testOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className={`input ${errors[`test_${index}_score`] ? 'input-error' : ''}`}
                      value={test.score}
                      onChange={(e) => updateTest(index, 'score', e.target.value)}
                      placeholder="Score"
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>/</span>
                    <input
                      type="number"
                      className={`input ${errors[`test_${index}_total`] ? 'input-error' : ''}`}
                      value={test.total}
                      onChange={(e) => updateTest(index, 'total', e.target.value)}
                      placeholder="Total"
                      readOnly={isKnownTest(test.name)}
                      title={isKnownTest(test.name) ? `${test.name} total is fixed at ${getTestTotal(test.name)}` : 'Custom total'}
                    />
                    <button className="btn btn-secondary btn-icon" onClick={() => removeTest(index)}>×</button>
                  </div>
                  {(errors[`test_${index}_score`] || errors[`test_${index}_total`]) && (
                    <div className="error-message" style={{ marginTop: 4 }}>
                      {errors[`test_${index}_score`] || errors[`test_${index}_total`]}
                    </div>
                  )}
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={addTest}>+ Add Test</button>
            </div>
          )}

          {steps[step].id === 'program' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div className="input-group">
                <label className="input-label">Preferred Field / Program</label>
                <select
                  className={`select ${errors.preferred_program ? 'input-error' : ''}`}
                  value={profile.preferred_program}
                  onChange={(e) => updateProfile({ preferred_program: e.target.value })}
                >
                  <option value="">Select program</option>
                  {programs.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.preferred_program && <span className="error-message">{errors.preferred_program}</span>}
              </div>
            </div>
          )}

          {steps[step].id === 'budget' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div className="input-group">
                <label className="input-label">Maximum Annual Budget (PKR)</label>
                <input
                  type="number"
                  className={`input ${errors.budget ? 'input-error' : ''}`}
                  value={profile.budget}
                  onChange={(e) => updateProfile({ budget: e.target.value })}
                  placeholder="e.g. 500000"
                />
                {errors.budget && <span className="error-message">{errors.budget}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Preferred Location</label>
                <input
                  className="input"
                  value={profile.location}
                  onChange={(e) => updateProfile({ location: e.target.value })}
                  placeholder="e.g. Lahore"
                />
              </div>
            </div>
          )}

          {steps[step].id === 'review' && (
            <div className="review-summary">
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Profile Summary</h3>
              <ReviewRow label="Name" value={profile.name} />
              <ReviewRow label="Matric" value={`${profile.matric_percentage}%`} />
              <ReviewRow label="Intermediate" value={`${profile.intermediate_percentage}%`} />
              <ReviewRow label="Qualification" value={profile.qualification} />
              <ReviewRow label="Tests" value={profile.tests.length ? profile.tests.map(t => `${t.name}: ${t.score}/${t.total}`).join(', ') : 'None'} />
              <ReviewRow label="Preferred Program" value={profile.preferred_program} />
              <ReviewRow label="Budget" value={`PKR ${Number(profile.budget).toLocaleString()}`} />
              <ReviewRow label="Location" value={profile.location} />
              {errors.submit && <div className="error-message" style={{ marginTop: 'var(--space-md)' }}>{errors.submit}</div>}
            </div>
          )}
        </div>

        <div className="step-actions">
          <button
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={step === 0}
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={nextStep}>Continue</button>
          ) : (
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
              {loading ? <Loading size={16} /> : 'Analyze My Options'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .stepper {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-2xl);
          position: relative;
        }
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          flex: 1;
          position: relative;
        }
        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--surface-soft);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-sm);
          font-weight: 700;
          z-index: 1;
          border: 2px solid transparent;
        }
        .step.active .step-circle {
          background: var(--accent);
          color: white;
        }
        .step.completed .step-circle {
          background: var(--accent-dark);
          color: white;
        }
        .step-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-secondary);
        }
        .step.active .step-label {
          color: var(--text-primary);
        }
        .step-line {
          position: absolute;
          top: 18px;
          left: 50%;
          right: -50%;
          height: 2px;
          background: var(--border);
          z-index: 0;
        }
        .step.completed .step-line {
          background: var(--accent);
        }
        .step-content {
          min-height: 240px;
        }
        .step-actions {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-xl);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border);
        }
        .test-row-wrapper {
          margin-bottom: var(--space-sm);
        }
        .test-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 20px 1fr auto;
          gap: var(--space-sm);
          align-items: center;
        }
        .review-summary {
          display: grid;
          gap: var(--space-md);
        }
        .review-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-md);
          background: var(--surface-soft);
          border-radius: var(--radius-md);
        }
        .review-row-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .review-row-value {
          font-size: var(--text-sm);
          font-weight: 700;
        }
        @media (max-width: 640px) {
          .stepper {
            overflow-x: auto;
            gap: var(--space-md);
          }
          .step-label {
            display: none;
          }
          .test-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="review-row">
      <span className="review-row-label">{label}</span>
      <span className="review-row-value">{value || '—'}</span>
    </div>
  )
}
