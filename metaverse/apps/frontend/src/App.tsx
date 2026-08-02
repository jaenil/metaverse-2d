import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { SpacePage } from './pages/SpacePage';
import { AdminPage } from './pages/AdminPage';
import { SignupPage } from './pages/SignupPage';
import { SigninPage } from './pages/SigninPage';
import { ProfilePage } from './pages/ProfilePage';
import { AvatarsPage } from './pages/AvatarsPage';
import { MapsPage } from './pages/MapsPage';
import { AboutPage } from './pages/AboutPage';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { PremiumBackground } from './components/PremiumBackground';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  const { theme, customBaseColor, customSurfaceColor, customBorderColor, customAccentColor } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'custom') {
      document.documentElement.style.setProperty('--bg', customBaseColor);
      document.documentElement.style.setProperty('--surface', customSurfaceColor);
      document.documentElement.style.setProperty('--border', customBorderColor);
      document.documentElement.style.setProperty('--accent', customAccentColor);
      
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1] ?? '0', 16)}, ${parseInt(result[2] ?? '0', 16)}, ${parseInt(result[3] ?? '0', 16)}` : '0, 0, 0';
      };
      document.documentElement.style.setProperty('--accent-raw', hexToRgb(customAccentColor));
    } else {
      document.documentElement.style.removeProperty('--bg');
      document.documentElement.style.removeProperty('--surface');
      document.documentElement.style.removeProperty('--border');
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--accent-raw');
    }
  }, [theme, customBaseColor, customSurfaceColor, customBorderColor, customAccentColor]);

  return (
    <BrowserRouter>
      
      {/* Dynamic Premium Backgrounds */}
      <PremiumBackground style="combined" />

      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/avatars" element={<AvatarsPage />} />
        <Route path="/maps" element={<MapsPage />} />
        <Route path="/about" element={<AboutPage />} />
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