import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useProfile } from '../hooks/useProfile'
import { api } from '../services/api'
import { Loading } from '../components/ui/Loading'
import { Badge } from '../components/ui/Badge'

function cleanMarkdown(text) {
  if (!text) return ''
  return text
    // Fix escaped markdown headings (\### -> ###)
    .replace(/\\(#{1,6})/g, '$1')
    // Fix escaped bold/italic (\*\* -> **, \* -> *)
    .replace(/\\\*/g, '*')
    // Fix escaped horizontal rules (\--- -> ---)
    .replace(/\\---/g, '---')
    // Fix escaped list items (\- -> -, \+ -> +)
    .replace(/\\([+-])/g, '$1')
    // Fix escaped brackets and parens
    .replace(/\\([[\]()])/g, '$1')
    // Fix escaped underscores (\_ -> _)
    .replace(/\\_/g, '_')
}

const suggestions = [
  'Which universities offer BSCS under my budget?',
  'Am I eligible for FAST BSCS?',
  'What entry test do I need for ITU Lahore?',
  'Explain my top recommendation.',
]

export default function Counselor() {
  const { profile, analysis, setAnalysis, loading, setLoading } = useProfile()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am UniPath AI. Ask me anything about university admissions, eligibility, tests, fees, or deadlines.',
      badges: ['AI INSIGHT'],
    },
  ])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-load analysis when profile is complete but analysis is not yet available
  useEffect(() => {
    if (!analysis && isCompleteFn(profile)) {
      setLoading(true)
      api.analyzeProfile(normalizeProfile(profile))
        .then((data) => setAnalysis(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [analysis, profile, setAnalysis, setLoading])

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
        { recommendations: analysis?.recommendations || [] },
        conversationId
      )
      setConversationId(data.conversation_id || conversationId)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.response,
          badges: data.badges || ['AI INSIGHT'],
          sources: data.sources || [],
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
                <div className="counselor-text counselor-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleanMarkdown(msg.text)}
                  </ReactMarkdown>
                </div>
                {msg.sources?.length > 0 && (() => {
                  const uniqueUniversities = Array.from(
                    new Set(msg.sources.map((source) => source.university).filter(Boolean))
                  )
                  if (uniqueUniversities.length === 0) return null
                  return (
                    <div className="counselor-sources">
                      <div className="counselor-sources-header">Sources:</div>
                      <ul className="counselor-sources-list">
                        {uniqueUniversities.map((uni) => (
                          <li key={uni} className="counselor-source-item">{uni}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })()}
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
          max-width: 75%;
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
        }
        .counselor-markdown p {
          margin: 0 0 var(--space-sm) 0;
        }
        .counselor-markdown p:last-child {
          margin-bottom: 0;
        }
        .counselor-markdown h1,
        .counselor-markdown h2,
        .counselor-markdown h3,
        .counselor-markdown h4 {
          margin: var(--space-md) 0 var(--space-xs) 0;
          font-weight: 700;
          color: inherit;
          line-height: 1.3;
        }
        .counselor-markdown h1:first-child,
        .counselor-markdown h2:first-child,
        .counselor-markdown h3:first-child,
        .counselor-markdown h4:first-child {
          margin-top: 0;
        }
        .counselor-markdown h1 { font-size: 1.15rem; }
        .counselor-markdown h2 { font-size: 1.05rem; }
        .counselor-markdown h3 { font-size: 0.95rem; }
        .counselor-markdown h4 { font-size: 0.88rem; }
        .counselor-markdown ul,
        .counselor-markdown ol {
          margin: 0 0 var(--space-sm) 0;
          padding-left: var(--space-lg);
        }
        .counselor-markdown li {
          margin-bottom: 4px;
        }
        .counselor-markdown li:last-child {
          margin-bottom: 0;
        }
        .counselor-markdown strong {
          font-weight: 700;
        }
        .counselor-markdown hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: var(--space-md) 0;
        }
        .counselor-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin: var(--space-md) 0;
          font-size: var(--text-xs);
          display: block;
          overflow-x: auto;
        }
        .counselor-markdown th,
        .counselor-markdown td {
          padding: 8px 10px;
          border: 1px solid var(--border);
          text-align: left;
        }
        .counselor-markdown th {
          background: rgba(0, 0, 0, 0.05);
          font-weight: 700;
        }
        .counselor-markdown code {
          background: rgba(0, 0, 0, 0.06);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85em;
          font-family: monospace;
        }
        .counselor-message.user .counselor-markdown code {
          background: rgba(255, 255, 255, 0.2);
        }
        .counselor-message.user .counselor-markdown th {
          background: rgba(255, 255, 255, 0.15);
        }
        .counselor-message.user .counselor-markdown th,
        .counselor-message.user .counselor-markdown td {
          border-color: rgba(255, 255, 255, 0.25);
        }
        .counselor-message.user .counselor-markdown hr {
          border-color: rgba(255, 255, 255, 0.25);
        }
        .counselor-sources {
          margin-top: var(--space-md);
          padding-top: var(--space-sm);
          border-top: 1px dashed var(--border);
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .counselor-sources-header {
          font-weight: 700;
          margin-bottom: var(--space-xs);
          color: var(--text-primary);
        }
        .counselor-sources-list {
          list-style: disc;
          padding-left: var(--space-md);
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .counselor-source-item {
          font-size: var(--text-xs);
        }
        .counselor-message.user .counselor-sources {
          color: rgba(255, 255, 255, 0.9);
          border-top-color: rgba(255, 255, 255, 0.25);
        }
        .counselor-message.user .counselor-sources-header {
          color: white;
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

function isCompleteFn(profile) {
  return (
    profile.name &&
    profile.matric_percentage !== '' &&
    profile.intermediate_percentage !== '' &&
    profile.qualification &&
    profile.preferred_program &&
    profile.budget !== ''
  )
}
