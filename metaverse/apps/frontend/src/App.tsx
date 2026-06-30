import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { SpacePage } from './pages/SpacePage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { AvatarsPage } from './pages/AvatarsPage';
import { MapsPage } from './pages/MapsPage';
import { LobbyPage } from './pages/LobbyPage';
import { AppLayout } from './components/AppLayout';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/signin" element={<AuthPage />} />
        {/* AppLayout handles the Sidebar and Navbar for all dashboard-related pages */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/avatars" element={<AvatarsPage />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* SpacePage remains separate as it has a fullscreen 2D Canvas layout */}
        <Route
          path="/space/:spaceId"
          element={<ProtectedRoute><SpacePage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}