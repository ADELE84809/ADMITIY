import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App'
import Auth from './pages/Auth'
import { AuthProvider, useAuth } from './lib/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import Universities from './pages/Universities'
import UniversityDetail from './pages/UniversityDetail'
import ApplicationSimulator from './pages/ApplicationSimulator'
import SatPrep from './pages/SatPrep'
import Roadmaps from './pages/Roadmaps'
import Extracurriculars from './pages/Extracurriculars'
import Scholarships from './pages/Scholarships'
import Research from './pages/Research'
import ProfileScorer from './pages/ProfileScorer'
import NotFound from './pages/NotFound'

function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="universities" element={<Universities />} />
          <Route path="universities/:id" element={<UniversityDetail />} />
          <Route path="simulator" element={<ApplicationSimulator />} />
          <Route path="sat-prep" element={<SatPrep />} />
          <Route path="roadmaps" element={<Roadmaps />} />
          <Route path="extracurriculars" element={<Extracurriculars />} />
          <Route path="scholarships" element={<Scholarships />} />
          <Route path="research" element={<Research />} />
          <Route path="profile-scorer" element={<ProfileScorer />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ErrorBoundary>
    <Analytics />
  </React.StrictMode>
)
