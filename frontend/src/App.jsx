import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Universities from './pages/Universities'
import Recommendations from './pages/Recommendations'
import Compare from './pages/Compare'
import Deadlines from './pages/Deadlines'
import Analytics from './pages/Analytics'
import Counselor from './pages/Counselor'
import Sources from './pages/Sources'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/deadlines" element={<Deadlines />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/counselor" element={<Counselor />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
