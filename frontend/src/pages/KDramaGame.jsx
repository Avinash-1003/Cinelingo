// ─────────────────────────────────────────────────────────────────────────────
// K-Drama Simulator — Page wrapper with Advanced level gate
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import KDramaGame from '../kdrama/KDramaGame';
import Navbar from '../components/Navbar';

function KDramaLockedScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [xpProgress, setXpProgress] = useState(0);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    // Try to get current XP
    try {
      const stats = localStorage.getItem('cinelingo_player_stats');
      if (stats) {
        const parsed = JSON.parse(stats);
        setXpProgress(parsed.totalXP || 0);
      }
    } catch {}
  }, []);

  const needed = 1000;
  const pct = Math.min(Math.round((xpProgress / needed) * 100), 99);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #050510, #0a0f1e, #0f0a18)',
      fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Orbitron:wght@600;700;800&family=Noto+Sans+KR:wght@400;700;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes fadeScale { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* Background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', width: '2px', height: '2px', borderRadius: '50%',
            background: ['#ff8fab', '#7c8cf8', '#a78bfa'][i % 3],
            opacity: 0.1 + Math.random() * 0.2,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(233,69,96,0.05), transparent 70%)',
        top: '30%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
      }} />

      <div style={{
        textAlign: 'center', maxWidth: '480px', padding: '48px 40px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '28px', backdropFilter: 'blur(20px)',
        animation: 'fadeScale 0.6s ease', position: 'relative',
      }}>
        {/* Lock icon */}
        <div style={{
          fontSize: '72px', marginBottom: '20px',
          animation: 'float 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 20px rgba(233,69,96,0.3))',
        }}>
          🔒
        </div>

        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '10px', fontWeight: 600, letterSpacing: '5px',
          color: 'rgba(255,255,255,0.25)', marginBottom: '12px',
        }}>
          ADVANCED LEVEL REQUIRED
        </div>

        <h1 style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '36px', fontWeight: 900, margin: '0 0 4px',
          background: 'linear-gradient(135deg, #ff8fab, #e8698d, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          K-Drama Simulator
        </h1>

        <p style={{
          fontSize: '14px', color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.7, margin: '16px 0 28px',
        }}>
          This immersive experience requires <strong style={{ color: '#e94560' }}>Advanced level</strong> proficiency.
          Keep learning and playing to unlock this feature!
        </p>

        {/* XP Progress */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '20px', marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Your Progress</span>
            <span style={{ color: '#e94560', fontWeight: 700, fontFamily: "'Orbitron', sans-serif" }}>
              {xpProgress} / {needed} XP
            </span>
          </div>
          <div style={{
            height: '8px', background: 'rgba(255,255,255,0.06)',
            borderRadius: '4px', overflow: 'hidden',
          }}>
            <div style={{
              width: `${pct}%`, height: '100%', borderRadius: '4px',
              background: 'linear-gradient(90deg, #e94560, #fb923c)',
              transition: 'width 1.5s ease',
              boxShadow: '0 0 12px rgba(233,69,96,0.4)',
            }} />
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>
            {needed - xpProgress > 0 ? `${needed - xpProgress} XP to unlock` : 'Almost there!'} • Earn XP in Learn & Voice Game
          </div>
        </div>

        {/* How to unlock steps */}
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '28px', justifyContent: 'center',
        }}>
          {[
            { icon: '📖', label: 'Study Scenes', desc: 'Learn page' },
            { icon: '🎮', label: 'Play Games', desc: 'Voice Game' },
            { icon: '🏆', label: 'Reach Advanced', desc: '1000+ XP' },
          ].map((step, i) => (
            <div key={i} style={{
              flex: 1, padding: '14px 8px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{step.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#ccc', marginBottom: '2px' }}>{step.label}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>{step.desc}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/learn')}
            onMouseEnter={() => setHovered('learn')}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: '14px 28px', borderRadius: '14px',
              background: hovered === 'learn'
                ? 'linear-gradient(135deg, rgba(233,69,96,0.25), rgba(233,69,96,0.1))'
                : 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(233,69,96,0.05))',
              border: '1px solid rgba(233,69,96,0.3)',
              color: '#e94560', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.3s',
              transform: hovered === 'learn' ? 'translateY(-2px)' : 'none',
            }}
          >
            📖 Start Learning
          </button>
          <button
            onClick={() => navigate('/game')}
            onMouseEnter={() => setHovered('game')}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: '14px 28px', borderRadius: '14px',
              background: hovered === 'game'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.3s',
              transform: hovered === 'game' ? 'translateY(-2px)' : 'none',
            }}
          >
            🎮 Play Game
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function KDramaGamePage() {
  // The AdvancedRoute in App.jsx already handles redirect,
  // but this serves as a fallback beautiful lock screen
  return (
    <div style={{ minHeight: '100vh', background: '#030008' }}>
      <Navbar />
      <KDramaGame />
    </div>
  );
}

// Export the locked screen separately for use in Home.jsx
export { KDramaLockedScreen };
