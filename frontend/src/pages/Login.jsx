import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';

// Rotating Korean phrases shown on the left panel
const PHRASES = [
  { korean: '안녕하세요!',       rom: 'An-nyeong-ha-se-yo',    english: 'Hello!' },
  { korean: '잘 부탁드립니다.',   rom: 'Jal bu-tak-deu-rim-ni-da', english: 'Nice to meet you.' },
  { korean: '화이팅!',           rom: 'Hwa-i-ting',            english: "Let's go! / Fighting!" },
  { korean: '천천히 말해주세요.', rom: 'Cheon-cheon-hi mal-hae-ju-se-yo', english: 'Please speak slowly.' },
  { korean: '다시 한번 해봐요!',  rom: 'Da-si han-beon hae-bwa-yo', english: 'Try once more!' },
];

export default function Login() {
  const { login, user }  = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate          = useNavigate();

  const [tab, setTab]           = useState('login');   // 'login' | 'register'
  const [form, setForm]         = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [phraseVisible, setPhraseVisible] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Cycle background phrases
  useEffect(() => {
    const id = setInterval(() => {
      setPhraseVisible(false);
      setTimeout(() => {
        setPhraseIdx(i => (i + 1) % PHRASES.length);
        setPhraseVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tab === 'register') {
      if (!form.username.trim())          return setError('Username is required.');
      if (!form.email.trim())             return setError('Email is required.');
      if (form.password.length < 6)       return setError('Password must be at least 6 characters.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    } else {
      if (!form.username.trim())          return setError('Username is required.');
      if (!form.password)                 return setError('Password is required.');
    }

    setLoading(true);
    try {
      if (tab === 'register') {
        const res = await userAPI.register({
          username: form.username.trim(),
          email:    form.email.trim(),
          password: form.password,
        });
        const data = res.data;
        if (data.token) localStorage.setItem('cinelingo_token', data.token);
        login({ id: data.id || data.userId, username: data.username || form.username, email: data.email || form.email });
        navigate('/');
      } else {
        const res = await userAPI.login({
          username: form.username.trim(),
          password: form.password,
        });
        const data = res.data;
        if (data.token) localStorage.setItem('cinelingo_token', data.token);
        login({ id: data.id || data.userId, username: data.username || form.username, email: data.email });
        navigate('/');
      }
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || data?.message || err.message;
      setError(typeof msg === 'string' ? msg : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Guest / demo bypass (useful when backend is offline) ──────────────────
  const continueAsGuest = () => {
    login({ id: 'guest', username: 'Guest', email: '' });
    navigate('/');
  };

  const phrase = PHRASES[phraseIdx];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: isDark ? '#08081a' : '#f5f5f7',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: isDark ? '#fff' : '#1a1a2e',
      transition: 'background 0.4s ease, color 0.4s ease',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 24px rgba(233,69,96,0.25)} 50%{box-shadow:0 0 48px rgba(233,69,96,0.5)} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 40px ${isDark ? '#13132a' : '#f5f5f7'} inset!important; -webkit-text-fill-color:${isDark ? '#fff' : '#1a1a2e'}!important; }
        .auth-input { width:100%; padding:13px 16px; background:${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}; border:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius:12px; color:${isDark ? '#fff' : '#1a1a2e'}; font-size:15px; outline:none; font-family:inherit; box-sizing:border-box; transition:border-color .2s, background .4s; }
        .auth-input:focus { border-color:#e94560; }
        .auth-input::placeholder { color:${isDark ? '#444' : '#aaa'}; }
        .auth-btn { width:100%; padding:14px; border:none; border-radius:12px; color:#fff; font-size:16px; font-weight:800; cursor:pointer; font-family:inherit; transition:all .22s; }
        .auth-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 36px rgba(233,69,96,0.45); }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .tab-btn { flex:1; padding:11px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .2s; }
        @media (max-width:700px) {
          .login-grid { grid-template-columns:1fr!important; }
          .login-left  { display:none!important; }
        }
      `}</style>

      {/* ── LEFT PANEL — branding + rotating phrase ─────────────────────────── */}
      <div className="login-left" style={{
        background: isDark ? 'linear-gradient(160deg,#0d0d22,#1a0d1a)' : 'linear-gradient(160deg,#eae8ef,#f0edf3)',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px', position: 'relative', overflow: 'hidden',
        transition: 'background 0.4s ease',
      }}>
        {/* Ambient glow blobs */}
        <div style={{ position:'absolute', top:'-60px', left:'-60px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(233,69,96,0.06)', filter:'blur(60px)' }}/>
        <div style={{ position:'absolute', bottom:'-40px', right:'-40px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(167,139,250,0.06)', filter:'blur(50px)' }}/>

        {/* Logo */}
        <div style={{ fontSize:'32px', fontWeight:'900', color:'#e94560', fontFamily:"'Syne',sans-serif", marginBottom:'8px', animation:'glow 3s ease infinite' }}>
          🎬 CineLingo
        </div>
        <div style={{ fontSize:'13px', color: isDark ? '#555' : '#888', marginBottom:'56px' }}>
          Learn Korean through K-Dramas
        </div>

        {/* Rotating Korean phrase card */}
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
          border: `1px solid ${isDark ? 'rgba(233,69,96,0.2)' : 'rgba(233,69,96,0.15)'}`,
          borderRadius: '24px', padding: '36px 32px',
          textAlign: 'center', width: '100%', maxWidth: '340px',
          opacity: phraseVisible ? 1 : 0,
          transform: phraseVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.4s ease',
          boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize:'11px', color:'#e94560', fontWeight:'700', letterSpacing:'2px', marginBottom:'16px' }}>
            PHRASE OF THE MOMENT
          </div>
          <div style={{ fontSize:'36px', fontWeight:'900', fontFamily:"'Syne',sans-serif", marginBottom:'10px', lineHeight:1.2 }}>
            {phrase.korean}
          </div>
          <div style={{ fontSize:'15px', color:'#e94560', fontWeight:'600', marginBottom:'6px' }}>
            {phrase.rom}
          </div>
          <div style={{ fontSize:'17px', color:'#4ade80', fontWeight:'700' }}>
            {phrase.english}
          </div>
        </div>

        {/* Feature list */}
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '340px' }}>
          {[
            ['🎬', '10 real K-Drama scenes'],
            ['🎤', 'Voice quiz — no typing needed'],
            ['🎮', 'Speak Korean to control your character'],
            ['🏆', 'Global leaderboard'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px',
              fontSize: '13px', color: isDark ? '#555' : '#888' }}>
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — form ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 40px', animation: 'fadeUp .4s ease',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Header */}
          {/* Theme toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button onClick={toggleTheme} style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              cursor: 'pointer', fontSize: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', color: '#e94560', fontWeight: '700', letterSpacing: '2px', marginBottom: '8px' }}>
              {tab === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: '900', fontFamily: "'Syne',sans-serif", margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              {tab === 'login' ? '다시 만나요! 👋' : '시작해봐요! 🚀'}
            </h1>
            <p style={{ fontSize: '13px', color: isDark ? '#555' : '#888', margin: 0 }}>
              {tab === 'login'
                ? 'Sign in to continue your Korean journey.'
                : 'Join thousands learning Korean through drama.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
            borderRadius: '14px', padding: '6px' }}>
            {[['login', '🔑 Sign In'], ['register', '✨ Register']].map(([t, label]) => (
              <button key={t} className="tab-btn"
                onClick={() => { setTab(t); setError(''); }}
                style={{
                  border: tab === t ? '1px solid rgba(233,69,96,0.4)' : '1px solid transparent',
                  background: tab === t ? 'rgba(233,69,96,0.12)' : 'transparent',
                  color: tab === t ? '#e94560' : '#555',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Username */}
            <div>
              <label style={{ fontSize: '12px', color: isDark ? '#555' : '#888', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                Username
              </label>
              <input
                className="auth-input"
                name="username"
                placeholder="e.g. kdrama_fan99"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            {/* Email (register only) */}
            {tab === 'register' && (
              <div>
                <label style={{ fontSize: '12px', color: '#555', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  className="auth-input"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label style={{ fontSize: '12px', color: '#555', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <input
                className="auth-input"
                name="password"
                type="password"
                placeholder={tab === 'register' ? 'Minimum 6 characters' : 'Your password'}
                value={form.password}
                onChange={handleChange}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {/* Confirm password (register only) */}
            {tab === 'register' && (
              <div>
                <label style={{ fontSize: '12px', color: '#555', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Confirm Password
                </label>
                <input
                  className="auth-input"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(233,69,96,0.1)',
                border: '1px solid rgba(233,69,96,0.35)',
                fontSize: '13px', color: '#e94560', fontWeight: '600',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
              style={{
                marginTop: '4px',
                background: loading
                  ? 'rgba(233,69,96,0.4)'
                  : 'linear-gradient(135deg,#e94560,#c73652)',
                boxShadow: '0 4px 24px rgba(233,69,96,0.3)',
              }}>
              {loading
                ? '잠깐만요... ⏳'
                : tab === 'login' ? '🔑 Sign In' : '🚀 Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)' }}/>
            <span style={{ fontSize: '12px', color: isDark ? '#333' : '#aaa' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }}/>
          </div>

          {/* Guest button */}
          <button
            onClick={continueAsGuest}
            style={{
              width: '100%', padding: '13px',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: '12px', color: isDark ? '#888' : '#666',
              fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all .2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}
            onMouseOut={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}
          >
            👤 Continue as Guest
          </button>

          {/* Backend offline note */}
          <div style={{
            marginTop: '20px', padding: '12px 16px',
            background: isDark ? 'rgba(248,211,71,0.05)' : 'rgba(248,211,71,0.08)',
            border: `1px solid ${isDark ? 'rgba(248,211,71,0.15)' : 'rgba(248,211,71,0.25)'}`,
            borderRadius: '10px', fontSize: '12px', color: isDark ? '#555' : '#888', lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: '#f8d347' }}>Backend offline?</strong> Use "Continue as Guest" to explore the app.
            Your progress won't be saved to the server, but all features work locally.
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '11px', color: isDark ? '#333' : '#bbb' }}>
            By signing up you agree to our terms of service.
          </div>
        </div>
      </div>
    </div>
  );
}
