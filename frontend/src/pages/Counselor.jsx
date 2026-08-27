import { useState, useRef, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import { api } from '../services/api'
import { Loading } from '../components/ui/Loading'
import { Badge } from '../components/ui/Badge'

const suggestions = [
  'Which universities offer BSCS under my budget?',
  'Am I eligible for FAST BSCS?',
  'What entry test do I need for COMSATS?',
  'Explain my top recommendation.',
]

export default function Counselor() {
  const { profile, analysis } = useProfile()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am UniPath AI. Ask me anything about university admissions, eligibility, tests, fees, or deadlines.',
      badges: ['AI INSIGHT'],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMessage = { role: 'user', text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const data = await api.chatWithCounselor(
        text,
        normalizeProfile(profile),
        { recommendations: analysis?.recommendations || [] }
      )
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.response,
          badges: data.badges || ['AI INSIGHT'],
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'AI counselor is temporarily unavailable. Your structured admission results are still available.',
          badges: ['SYSTEM'],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="page counselor-page">
      <div className="page-header">
        <h1 className="page-title">AI Admission Counselor</h1>
        <p className="page-subtitle">Ask questions grounded in your verified admission data.</p>
      </div>

      <div className="card counselor-card">
        <div className="counselor-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`counselor-message ${msg.role}`}>
              <div className="counselor-avatar">
                {msg.role === 'user' ? 'US' : 'AI'}
              </div>
              <div className="counselor-bubble">
                {msg.badges && (
                  <div className="counselor-badges">
                    {msg.badges.map((badge) => (
                      <Badge key={badge} variant={badge === 'FACT' ? 'success' : badge === 'CALCULATED' ? 'info' : badge === 'RECOMMENDATION' ? 'warning' : 'neutral'}>
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="counselor-text">{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="counselor-message assistant">
              <div className="counselor-avatar">AI</div>
              <div className="counselor-bubble">
                <Loading size={20} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="counselor-suggestions">
          {suggestions.map((s) => (
            <button key={s} className="btn btn-secondary btn-sm" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>

        <form className="counselor-input" onSubmit={handleSubmit}>
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>

      <style>{`
        .counselor-page {
          display: flex;
          flex-direction: column;
        }
        .counselor-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 520px;
        }
        .counselor-messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          padding-right: var(--space-sm);
          margin-bottom: var(--space-md);
          max-height: 520px;
        }
        .counselor-message {
          display: flex;
          gap: var(--space-md);
          align-items: flex-start;
        }
        .counselor-message.user {
          flex-direction: row-reverse;
        }
        .counselor-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--surface-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--accent-dark);
          flex-shrink: 0;
        }
        .counselor-bubble {
          max-width: 70%;
          background: var(--surface-soft);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
        }
        .counselor-message.user .counselor-bubble {
          background: var(--accent);
          color: white;
        }
        .counselor-badges {
          display: flex;
          gap: var(--space-xs);
          margin-bottom: var(--space-sm);
          flex-wrap: wrap;
        }
        .counselor-text {
          font-size: var(--text-sm);
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .counselor-suggestions {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-bottom: var(--space-md);
          padding-top: var(--space-md);
          border-top: 1px solid var(--border);
        }
        .counselor-input {
          display: flex;
          gap: var(--space-md);
        }
        .counselor-input .input {
          flex: 1;
        }
        @media (max-width: 640px) {
          .counselor-input {
            flex-direction: column;
          }
          .counselor-bubble {
            max-width: 85%;
          }
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
