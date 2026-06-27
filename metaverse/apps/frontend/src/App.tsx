import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { SpacePage } from './pages/SpacePage';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { AvatarsPage } from './pages/AvatarsPage';
import { MapsPage } from './pages/MapsPage';
import { LobbyPage } from './pages/LobbyPage';
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
        <Route
          path="/lobby"
          element={<ProtectedRoute><LobbyPage /></ProtectedRoute>}
        />
        <Route
          path="/home-page"
          element={<ProtectedRoute><HomePage /></ProtectedRoute>}
        />
        <Route
          path="/avatars"
          element={<ProtectedRoute><AvatarsPage /></ProtectedRoute>}
        />
        <Route
          path="/maps"
          element={<ProtectedRoute><MapsPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/space/:spaceId"
          element={<ProtectedRoute><SpacePage /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute><AdminPage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}