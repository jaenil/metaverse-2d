import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { SpacePage } from './pages/SpacePage';
import { AdminPage } from './pages/AdminPage';
import { SignupPage } from './pages/SignupPage';
import { SigninPage } from './pages/SigninPage';
import { HomePage } from './pages/HomePage';
import { AvatarsPage } from './pages/AvatarsPage';
import { MapsPage } from './pages/MapsPage';
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
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/avatars" element={<AvatarsPage />} />
        <Route path="/maps" element={<MapsPage />} />
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