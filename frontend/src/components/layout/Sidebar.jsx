import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/profile', label: 'Profile', icon: '◉' },
  { to: '/universities', label: 'Universities', icon: '▣' },
  { to: '/recommendations', label: 'Recommendations', icon: '★' },
  { to: '/compare', label: 'Compare', icon: '☰' },
  { to: '/deadlines', label: 'Deadlines', icon: '◷' },
  { to: '/analytics', label: 'Analytics', icon: '◧' },
  { to: '/counselor', label: 'AI Counselor', icon: '◆' },
  { to: '/sources', label: 'Sources', icon: '◉' },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#8FAE70" />
            <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="sidebar-title">
          <span>UniPath</span>
          <span>AI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <span>US</span>
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">Student</span>
            <span className="sidebar-user-role">Lahore, PK</span>
          </div>
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: var(--space-xl) var(--space-lg);
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-2xl);
        }

        .sidebar-logo {
          width: 40px;
          height: 40px;
        }

        .sidebar-logo svg {
          width: 100%;
          height: 100%;
        }

        .sidebar-title {
          display: flex;
          flex-direction: column;
          font-weight: 700;
          line-height: 1.2;
        }

        .sidebar-title span:first-child {
          font-size: var(--text-lg);
          color: var(--text-primary);
        }

        .sidebar-title span:last-child {
          font-size: var(--text-xs);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent-dark);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          flex: 1;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: var(--text-sm);
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .sidebar-link:hover {
          background: var(--surface-soft);
          color: var(--text-primary);
        }

        .sidebar-link.active {
          background: var(--accent);
          color: var(--text-on-dark);
        }

        .sidebar-icon {
          width: 20px;
          text-align: center;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .sidebar-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--surface-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--accent-dark);
        }

        .sidebar-user-info {
          display: flex;
          flex-direction: column;
          font-size: var(--text-sm);
        }

        .sidebar-user-name {
          font-weight: 700;
          color: var(--text-primary);
        }

        .sidebar-user-role {
          color: var(--text-secondary);
          font-size: var(--text-xs);
        }

        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            top: auto;
            height: auto;
            width: 100%;
            flex-direction: row;
            padding: var(--space-sm);
            z-index: 100;
            border-right: none;
            border-top: 1px solid var(--border);
          }

          .sidebar-brand,
          .sidebar-footer,
          .sidebar-label {
            display: none;
          }

          .sidebar-nav {
            flex-direction: row;
            justify-content: space-around;
            width: 100%;
          }

          .sidebar-link {
            flex-direction: column;
            padding: var(--space-sm);
            font-size: var(--text-xs);
          }

          .app-content {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </aside>
  )
}
