import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Login'
import AdminLayout from './pages/AdminLayout'
import Dashboard from './pages/Dashboard'
import ProjectCooperation from './pages/ProjectCooperation'
import TalentMatching from './pages/TalentMatching'
import AchievementPlaza from './pages/AchievementPlaza'
import SharedResources from './pages/SharedResources'
import ServicePool from './pages/ServicePool'
import TeachingResource from './pages/TeachingResource'
import DataCockpit from './pages/DataCockpit'
import PointsManagement from './pages/PointsManagement'
import SystemSettings from './pages/SystemSettings'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<ProjectCooperation />} />
        <Route path="talent" element={<TalentMatching />} />
        <Route path="achievements" element={<AchievementPlaza />} />
        <Route path="resources" element={<SharedResources />} />
        <Route path="services" element={<ServicePool />} />
        <Route path="teaching" element={<TeachingResource />} />
        <Route path="cockpit" element={<DataCockpit />} />
        <Route path="points" element={<PointsManagement />} />
        <Route path="system" element={<SystemSettings />} />
      </Route>
      <Route path="/" element={user ? <Navigate to="/admin/dashboard" replace /> : <LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
