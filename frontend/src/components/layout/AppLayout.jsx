import { Sidebar } from './Sidebar'

export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        {children}
      </div>
    </div>
  )
}
