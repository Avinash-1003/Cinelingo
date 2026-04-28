import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import Login       from './pages/Login';
import Home        from './pages/Home';
import Learn       from './pages/Learn';
import Game        from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Profile     from './pages/Profile';
import KDramaGame  from './pages/KDramaGame';

// ── Guard: redirects to /login if not authenticated ─────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: isDark ? '#08081a' : '#f5f5f7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{
          width: '40px', height: '40px', border: '3px solid rgba(233,69,96,0.15)',
          borderTop: '3px solid #e94560', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}/>
        <span style={{ color: isDark ? '#555' : '#888', fontSize: '14px' }}>불러오는 중... Loading</span>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// ── Guard: redirects if user is not Advanced level ──────────────────────────
function AdvancedRoute({ children }) {
  const { user } = useAuth();
  const [isAdvanced, setIsAdvanced] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    // Admin bypass
    if (user.username && user.username.toLowerCase() === 'admin') {
      setIsAdvanced(true);
      setLoading(false);
      return;
    }

    // Check localStorage first for instant response
    try {
      const progress = localStorage.getItem(`cinelingo_progress_${user.id}`);
      if (progress) {
        const parsed = JSON.parse(progress);
        if (parsed.totalXp >= 1000 || parsed.currentLevel === 'advanced') {
          setIsAdvanced(true);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Also check the game stats (voice game XP) — more generous check
    try {
      const gameStats = localStorage.getItem('cinelingo_player_stats');
      if (gameStats) {
        const parsed = JSON.parse(gameStats);
        if (parsed.totalXP >= 1000) {
          setIsAdvanced(true);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Try backend as well
    const API = 'http://localhost:8081';
    const tok = localStorage.getItem('cinelingo_token') || '';
    if (user.id && user.id !== 'guest') {
      fetch(`${API}/api/recommendations/progress/${user.id}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok}` },
        signal: AbortSignal.timeout(3000),
      })
        .then(r => r.ok ? r.json() : {})
        .then(data => {
          if (data.totalXp >= 1000 || data.currentLevel === 'advanced') {
            setIsAdvanced(true);
          } else {
            setIsAdvanced(false);
          }
        })
        .catch(() => setIsAdvanced(false))
        .finally(() => setLoading(false));
    } else {
      setIsAdvanced(false);
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: isDark ? '#08081a' : '#f5f5f7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{
          width: '40px', height: '40px', border: '3px solid rgba(233,69,96,0.15)',
          borderTop: '3px solid #e94560', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}/>
      </div>
    );
  }

  if (!isAdvanced) {
    return <Navigate to="/" replace state={{ kdramaLocked: true }} />;
  }

  return children;
}

// ── Scroll to top on route change ───────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

// ── Root app ─────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/learn" element={<PrivateRoute><Learn /></PrivateRoute>} />
        <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
        <Route path="/kdrama" element={
          <PrivateRoute>
            <AdvancedRoute>
              <KDramaGame />
            </AdvancedRoute>
          </PrivateRoute>
        } />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
