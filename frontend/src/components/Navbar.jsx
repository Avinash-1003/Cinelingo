import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [showKdramaToast, setShowKdramaToast] = useState(false);

  const currentPath = location.pathname;

  // Check advanced level
  useEffect(() => {
    if (user?.username?.toLowerCase() === 'admin') {
      setIsAdvanced(true);
      return;
    }
    try {
      const stats = localStorage.getItem('cinelingo_player_stats');
      if (stats) {
        const parsed = JSON.parse(stats);
        const xp = parsed.totalXP || 0;
        setIsAdvanced(xp >= 1000);
      }
    } catch {}

    try {
      const progress = localStorage.getItem(`cinelingo_progress_${user?.id}`);
      if (progress) {
        const parsed = JSON.parse(progress);
        if (parsed.totalXp >= 1000 || parsed.currentLevel === 'advanced') {
          setIsAdvanced(true);
        }
      }
    } catch {}
  }, [user]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = () => setShowUserMenu(false);
    if (showUserMenu) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Theme-aware colors
  const navBg = isDark ? 'rgba(8,8,26,0.95)' : 'rgba(255,255,255,0.92)';
  const navBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const pillBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
  const pillBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const pillColor = isDark ? '#888' : '#666';
  const textMuted = isDark ? '#666' : '#888';
  const textFaint = isDark ? '#333' : '#ccc';
  const dropBg = isDark ? '#13132a' : '#fff';
  const dropBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const dropShadow = isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  const NAV_LINKS = [
    ['🏠 Home', '/'],
    ['📖 Learn', '/learn'],
    ['🎮 Voice Game', '/game'],
    ['🏙️ K-Drama Sim', '/kdrama'],
    ['🏆 Leaderboard', '/leaderboard'],
    ['👤 Profile', '/profile'],
  ];

  return (
    <>
      <style>{`
        .cl-nav-pill { transition: all .2s; }
        .cl-nav-pill:hover { background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} !important; }
        .cl-theme-toggle { transition: all .25s ease; }
        .cl-theme-toggle:hover { transform: scale(1.1); }
        .cl-logout-btn { transition: all .15s; }
        .cl-logout-btn:hover { background: rgba(233,69,96,0.15) !important; color: #e94560 !important; }
        @keyframes slideInRight { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* K-Drama Locked Toast */}
      {showKdramaToast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          padding: '16px 24px', borderRadius: '14px',
          background: isDark ? 'rgba(233,69,96,0.15)' : 'rgba(233,69,96,0.1)',
          border: '1px solid rgba(233,69,96,0.3)',
          backdropFilter: 'blur(12px)', maxWidth: '380px',
          animation: 'slideInRight 0.4s ease',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🔒</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#e94560' }}>K-Drama Simulator Locked</div>
              <div style={{ fontSize: '12px', color: textMuted, marginTop: '2px' }}>
                Reach Advanced level (1000+ XP) to unlock this feature
              </div>
            </div>
          </div>
        </div>
      )}

      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 32px', background: navBg,
        borderBottom: `1px solid ${navBorder}`,
        position: 'sticky', top: 0, zIndex: 200, backdropFilter: 'blur(14px)',
        transition: 'background 0.4s ease',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <div style={{
          fontSize: '20px', fontWeight: '900', color: '#e94560',
          fontFamily: "'Syne',sans-serif", letterSpacing: '-0.5px',
          cursor: 'pointer',
        }} onClick={() => navigate('/')}>
          🎬 CineLingo
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {NAV_LINKS.map(([label, path]) => {
            const isKdrama = path === '/kdrama';
            const isActive = currentPath === path;
            return (
              <button key={path} className="cl-nav-pill"
                onClick={() => {
                  if (isKdrama && !isAdvanced) {
                    setShowKdramaToast(true);
                    setTimeout(() => setShowKdramaToast(false), 3500);
                    return;
                  }
                  navigate(path);
                }}
                style={{
                  padding: '8px 16px', borderRadius: '10px', fontSize: '13px',
                  fontWeight: isActive ? '700' : '600', cursor: 'pointer', fontFamily: 'inherit',
                  background: isActive ? 'rgba(233,69,96,0.1)' : pillBg,
                  border: `1px solid ${isActive ? 'rgba(233,69,96,0.3)' : pillBorder}`,
                  color: isActive ? '#e94560' : pillColor,
                  position: 'relative',
                }}>
                {label}
                {isKdrama && !isAdvanced && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    fontSize: '10px', background: '#e94560', borderRadius: '50%',
                    width: '18px', height: '18px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>🔒</span>
                )}
              </button>
            );
          })}

          {/* Theme toggle */}
          <button className="cl-theme-toggle"
            onClick={toggleTheme}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              cursor: 'pointer', fontSize: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              marginLeft: '4px',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* User avatar + dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={e => { e.stopPropagation(); setShowUserMenu(m => !m); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#e94560,#c73652)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '900', fontFamily: "'Syne',sans-serif",
              color: '#fff',
            }}>
              {(user?.username || 'G').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: textMuted }}>{user?.username}</span>
            <span style={{ fontSize: '10px', color: textFaint }}>▼</span>
          </div>

          {showUserMenu && (
            <div onClick={e => e.stopPropagation()} style={{
              position: 'absolute', top: '44px', right: 0,
              background: dropBg, border: `1px solid ${dropBorder}`,
              borderRadius: '12px', padding: '6px', minWidth: '160px',
              zIndex: 300, boxShadow: dropShadow,
            }}>
              <div style={{
                padding: '10px 14px', fontSize: '13px', color: textMuted,
                borderBottom: `1px solid ${cardBorder}`, marginBottom: '4px'
              }}>
                <div style={{ fontWeight: '700', color: isDark ? '#ccc' : '#333' }}>{user?.username}</div>
                {user?.email && <div style={{ fontSize: '11px', marginTop: '2px' }}>{user.email}</div>}
              </div>
              <button className="cl-logout-btn"
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '9px 14px', textAlign: 'left',
                  background: 'transparent', border: 'none', color: textMuted,
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  fontFamily: 'inherit', borderRadius: '8px',
                }}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
