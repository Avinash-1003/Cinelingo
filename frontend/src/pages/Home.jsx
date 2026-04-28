import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

const speakKorean = (text) => {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR'; u.rate = 0.85; u.pitch = 1.1;
  window.speechSynthesis.speak(u);
};

const GREETINGS = [
  { korean: '안녕하세요!', rom: 'An-nyeong-ha-se-yo', english: 'Hello!' },
  { korean: '어서 오세요!', rom: 'Eo-seo o-se-yo', english: 'Welcome!' },
  { korean: '잘 지냈어요?', rom: 'Jal ji-naet-sseo-yo', english: 'Have you been well?' },
  { korean: '오늘도 화이팅!', rom: 'O-neul-do hwa-i-ting', english: 'Fighting spirit today too!' },
  { korean: '준비됐어요?', rom: 'Jun-bi-dwaet-sseo-yo', english: 'Are you ready?' },
];

const FEATURED_SCENES = [
  { emoji: '👋', title: 'Korean Greetings', scene: '안녕하세요!', level: 'Beginner', color: '#4ade80', route: '/learn' },
  { emoji: '🍜', title: 'Order Food', scene: '이거 주세요.', level: 'Beginner', color: '#38bdf8', route: '/learn' },
  { emoji: '💕', title: 'K-Drama Phrases', scene: '사랑해요.', level: 'Intermediate', color: '#e94560', route: '/learn' },
  { emoji: '🦑', title: 'Squid Game Korean', scene: '살아남아야 해.', level: 'Advanced', color: '#a78bfa', route: '/learn' },
];

const STATS = [
  { n: '10', label: 'Drama Scenes', icon: '🎬' },
  { n: '70+', label: 'Korean Lines', icon: '📜' },
  { n: '300+', label: 'Words & Phrases', icon: '🔤' },
  { n: '3', label: 'Game Modes', icon: '🎮' },
];

// ── Word of the Day pool ─────────────────────────────────────────────────────
const DAILY_WORDS = [
  { korean: '행복', rom: 'haeng-bok', english: 'Happiness', example: '행복해요!', exampleEn: "I'm happy!", emoji: '😊' },
  { korean: '사랑', rom: 'sa-rang', english: 'Love', example: '사랑해요.', exampleEn: 'I love you.', emoji: '💕' },
  { korean: '감사', rom: 'gam-sa', english: 'Gratitude', example: '감사합니다.', exampleEn: 'Thank you.', emoji: '🙏' },
  { korean: '친구', rom: 'chin-gu', english: 'Friend', example: '제 친구예요.', exampleEn: 'This is my friend.', emoji: '🤝' },
  { korean: '음식', rom: 'eum-sik', english: 'Food', example: '음식이 맛있어요!', exampleEn: 'The food is delicious!', emoji: '🍜' },
  { korean: '시간', rom: 'si-gan', english: 'Time', example: '시간이 없어요.', exampleEn: 'There is no time.', emoji: '⏰' },
  { korean: '별', rom: 'byeol', english: 'Star', example: '별이 예뻐요.', exampleEn: 'The stars are pretty.', emoji: '⭐' },
  { korean: '꿈', rom: 'kkum', english: 'Dream', example: '좋은 꿈 꿔요!', exampleEn: 'Sweet dreams!', emoji: '💫' },
  { korean: '노래', rom: 'no-rae', english: 'Song', example: '이 노래 좋아요.', exampleEn: 'I like this song.', emoji: '🎵' },
  { korean: '하늘', rom: 'ha-neul', english: 'Sky', example: '하늘이 아름다워요.', exampleEn: 'The sky is beautiful.', emoji: '🌤️' },
  { korean: '바다', rom: 'ba-da', english: 'Sea/Ocean', example: '바다에 가고 싶어요.', exampleEn: 'I want to go to the sea.', emoji: '🌊' },
  { korean: '힘', rom: 'him', english: 'Strength/Power', example: '힘내세요!', exampleEn: 'Stay strong!', emoji: '💪' },
  { korean: '마음', rom: 'ma-eum', english: 'Heart/Mind', example: '마음이 따뜻해요.', exampleEn: 'Your heart is warm.', emoji: '❤️' },
  { korean: '웃음', rom: 'us-eum', english: 'Laughter', example: '웃음이 예뻐요.', exampleEn: 'Your laughter is pretty.', emoji: '😂' },
];

function getTodayWord() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_WORDS[dayOfYear % DAILY_WORDS.length];
}

export default function Home() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [greetIdx, setGreetIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [time, setTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [showKdramaToast, setShowKdramaToast] = useState(false);
  const intervalRef = useRef(null);
  const todayWord = getTodayWord();

  // Check if K-Drama was locked redirect
  useEffect(() => {
    if (location.state?.kdramaLocked) {
      setShowKdramaToast(true);
      setTimeout(() => setShowKdramaToast(false), 4000);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
        setUserXP(xp);
        setIsAdvanced(xp >= 1000);
      }
    } catch { }
  }, [user]);

  // Cycle greetings
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setGreetIdx(i => (i + 1) % GREETINGS.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = () => setShowUserMenu(false);
    if (showUserMenu) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showUserMenu]);

  const greeting = GREETINGS[greetIdx];
  const hour = time.getHours();
  const timeGreet = hour < 12 ? '좋은 아침이에요! 🌅' : hour < 17 ? '좋은 오후예요! ☀️' : '좋은 저녁이에요! 🌙';
  const timeGreetEn = hour < 12 ? 'Good morning!' : hour < 17 ? 'Good afternoon!' : 'Good evening!';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Theme-aware colors
  const bg = isDark ? '#08081a' : '#f5f5f7';
  const textPrimary = isDark ? '#fff' : '#1a1a2e';
  const textMuted = isDark ? '#666' : '#888';
  const textDim = isDark ? '#444' : '#aaa';
  const textFaint = isDark ? '#333' : '#ccc';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const navBg = isDark ? 'rgba(8,8,26,0.95)' : 'rgba(255,255,255,0.92)';
  const navBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const pillBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
  const pillBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const pillColor = isDark ? '#888' : '#666';
  const dropBg = isDark ? '#13132a' : '#fff';
  const dropBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const dropShadow = isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)';
  const sectionBg = isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)';
  const sectionBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const cardShadow = isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)';

  const currentPath = location.pathname;

  return (
    <div style={{
      minHeight: '100vh', background: bg, color: textPrimary,
      fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden',
      transition: 'background 0.4s ease, color 0.4s ease',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 24px rgba(233,69,96,0.25)} 50%{box-shadow:0 0 48px rgba(233,69,96,0.5)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes slideOutRight { from{transform:translateX(0);opacity:1} to{transform:translateX(100%);opacity:0} }
        .scene-card:hover  { transform:translateY(-6px) scale(1.01)!important; }
        .scene-card        { transition:all .25s ease!important; }
        .main-btn:hover    { transform:translateY(-2px)!important; box-shadow:0 8px 36px rgba(233,69,96,0.5)!important; }
        .main-btn          { transition:all .22s ease!important; }
        .sec-btn:hover     { background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}!important; }
        .sec-btn           { transition:all .2s ease!important; }
        .nav-pill:hover    { background:${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}!important; }
        .nav-pill          { transition:all .2s; }
        .speak-chip:hover  { transform:scale(1.05); cursor:pointer; }
        .speak-chip        { transition:transform .15s; }
        .logout-btn:hover  { background:rgba(233,69,96,0.15)!important; color:#e94560!important; }
        .logout-btn        { transition:all .15s; }
        .theme-toggle:hover { transform:scale(1.1); }
        .theme-toggle      { transition:all .25s ease; }
      `}</style>

      {/* ── K-Drama Locked Toast ──────────────────────────────────────────── */}
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

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1100px', margin: '0 auto', padding: '64px 32px 48px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center',
        animation: 'fadeUp .5s ease',
      }}>
        {/* Left */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', background: isDark ? 'rgba(248,211,71,0.08)' : 'rgba(248,211,71,0.12)',
            border: `1px solid ${isDark ? 'rgba(248,211,71,0.2)' : 'rgba(248,211,71,0.3)'}`, borderRadius: '20px',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '12px', color: '#f8d347', fontWeight: '700' }}>{timeGreet}</span>
            <span style={{ fontSize: '11px', color: textDim }}>{timeGreetEn}</span>
          </div>

          <h1 style={{
            fontSize: '52px', fontWeight: '900', lineHeight: 1.1, margin: '0 0 16px',
            fontFamily: "'Syne',sans-serif", letterSpacing: '-1.5px',
            color: textPrimary,
          }}>
            Learn Korean<br />
            <span style={{ background: 'linear-gradient(135deg,#e94560,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Through Drama
            </span>
          </h1>

          <p style={{ fontSize: '16px', color: textMuted, lineHeight: 1.7, marginBottom: '28px', maxWidth: '440px' }}>
            Real scenes. Real scripts. Real Korean.
            Watch K-Drama clips, learn the exact dialogue, speak it yourself.
            Completely different from Duolingo.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button className="main-btn"
              onClick={() => navigate('/learn')}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg,#e94560,#c73652)',
                border: 'none', borderRadius: '14px', color: '#fff',
                fontSize: '16px', fontWeight: '800', cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 28px rgba(233,69,96,0.35)',
                animation: 'glow 3s ease infinite',
              }}>
              🎬 Start Learning
            </button>
            <button className="sec-btn"
              onClick={() => navigate('/game')}
              style={{
                padding: '14px 32px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '14px',
                color: isDark ? '#ccc' : '#444', fontSize: '16px', fontWeight: '700',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              🎮 Play Game
            </button>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#e94560', fontFamily: "'Syne',sans-serif" }}>
                  {s.icon} {s.n}
                </div>
                <div style={{ fontSize: '11px', color: textDim }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — greeting card */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            background: cardBg,
            border: `1px solid ${isDark ? 'rgba(233,69,96,0.2)' : 'rgba(233,69,96,0.15)'}`,
            borderRadius: '28px', padding: '40px 36px', textAlign: 'center',
            width: '100%', maxWidth: '380px',
            boxShadow: isDark ? '0 0 60px rgba(233,69,96,0.08)' : '0 4px 24px rgba(0,0,0,0.06)',
            position: 'relative', overflow: 'hidden',
            transition: 'background 0.4s ease',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(233,69,96,0.08)', filter: 'blur(40px)' }} />

            <div style={{ fontSize: '13px', color: '#e94560', fontWeight: '700', letterSpacing: '2px', marginBottom: '16px' }}>
              TODAY'S GREETING
            </div>

            <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease', marginBottom: '20px' }}>
              <div style={{ fontSize: '42px', fontWeight: '900', color: textPrimary, fontFamily: "'Syne',sans-serif", marginBottom: '8px', lineHeight: 1.2 }}>
                {greeting.korean}
              </div>
              <div style={{ fontSize: '16px', color: '#e94560', fontWeight: '600', marginBottom: '4px' }}>
                {greeting.rom}
              </div>
              <div style={{ fontSize: '18px', color: '#4ade80', fontWeight: '700' }}>
                {greeting.english}
              </div>
            </div>

            <button className="speak-chip"
              onClick={() => speakKorean(greeting.korean)}
              style={{
                padding: '10px 24px', background: 'rgba(233,69,96,0.12)',
                border: '1px solid rgba(233,69,96,0.3)', borderRadius: '10px',
                color: '#e94560', fontSize: '14px', fontWeight: '800',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}>
              🔊 Hear it
            </button>
            <div style={{ marginTop: '16px', fontSize: '11px', color: textFaint }}>
              Rotates every 3.5 seconds · Click 🔊 to hear pronunciation
            </div>
          </div>
        </div>
      </section>

      {/* ── WORD OF THE DAY ───────────────────────────────────────────────── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px 48px' }}>
        <div style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(167,139,250,0.06), rgba(233,69,96,0.04))'
            : 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(233,69,96,0.06))',
          border: `1px solid ${isDark ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.2)'}`,
          borderRadius: '24px', padding: '32px', display: 'flex', gap: '32px',
          alignItems: 'center', flexWrap: 'wrap',
          boxShadow: isDark ? 'none' : '0 2px 16px rgba(167,139,250,0.06)',
        }}>
          <div style={{ fontSize: '56px', animation: 'float 3s ease-in-out infinite' }}>
            {todayWord.emoji}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '700', letterSpacing: '3px', marginBottom: '8px' }}>
              WORD OF THE DAY
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '36px', fontWeight: '900', fontFamily: "'Syne',sans-serif", color: textPrimary }}>{todayWord.korean}</span>
              <span style={{ fontSize: '14px', color: '#a78bfa', fontWeight: '600' }}>{todayWord.rom}</span>
              <span style={{ fontSize: '16px', color: '#4ade80', fontWeight: '700' }}>{todayWord.english}</span>
            </div>
            <div style={{ fontSize: '14px', color: textMuted, marginTop: '8px' }}>
              <span style={{ color: '#e94560', fontWeight: '700' }}>"{todayWord.example}"</span>
              <span style={{ marginLeft: '8px', fontSize: '13px', color: textDim }}>— {todayWord.exampleEn}</span>
            </div>
          </div>
          <button className="speak-chip"
            onClick={() => speakKorean(todayWord.korean)}
            style={{
              padding: '12px 28px', background: 'rgba(167,139,250,0.12)',
              border: '1px solid rgba(167,139,250,0.3)', borderRadius: '12px',
              color: '#a78bfa', fontSize: '14px', fontWeight: '800',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}>
            🔊 Listen
          </button>
        </div>
      </section>

      {/* ── NAVIGATION CARDS ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px 56px' }}>
        <div style={{ fontSize: '11px', color: '#e94560', fontWeight: '700', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center' }}>
          WHERE DO YOU WANT TO GO?
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', textAlign: 'center', fontFamily: "'Syne',sans-serif", margin: '0 0 28px', color: textPrimary }}>
          Choose Your Path
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }}>
          {[
            {
              path: '/learn', icon: '🎬', tag: 'LEARN', color: '#4ade80',
              title: 'Drama Script Immersion',
              desc: 'Watch 10 real K-Drama clips. Read the exact script. Click any word to hear pronunciation. Shadow, quiz, master.',
              chips: ['📜 Script Mode', '🎤 Shadow Mode', '🧩 Voice Quiz'],
              cta: 'Start Learning →',
              locked: false,
            },
            {
              path: '/game', icon: '🎮', tag: 'MINI GAME', color: '#38bdf8',
              title: 'Voice Control Runner',
              desc: 'Speak Korean commands to control your character in a voice-driven runner game. No typing, pure voice.',
              chips: ['🏃 Runner', '🎤 Voice Control', '💀 Survival'],
              cta: 'Play Mini Game →',
              locked: false,
            },
            {
              path: '/kdrama', icon: '🏙️', tag: 'SIMULATION', color: '#e94560',
              title: 'K-Drama Simulator',
              desc: 'Walk around Seoul, interact with NPCs, build relationships, and shape your own K-Drama story using Korean dialogue.',
              chips: ['🤝 Relationships', '📖 Story Branches', '🗺️ Free Roam'],
              cta: isAdvanced ? 'Start Simulator →' : `🔒 Unlock at 1000 XP (${userXP}/1000)`,
              locked: !isAdvanced,
            },
            {
              path: '/leaderboard', icon: '🏆', tag: 'LEADERBOARD', color: '#f8d347',
              title: 'Global Rankings',
              desc: 'See top Korean voice game players worldwide. Filter by mode. Climb the ranks.',
              chips: ['🌍 Global', '📖 Story', '🔥 Thriller'],
              cta: 'View Rankings →',
              locked: false,
            },
            {
              path: '/profile', icon: '📊', tag: 'PROFILE', color: '#a78bfa',
              title: 'Your Progress',
              desc: 'Track your XP, streaks, achievements, pronunciation scores and vocabulary mastery.',
              chips: ['⭐ XP & Levels', '🏅 Achievements', '🎤 Pronunciation'],
              cta: 'View Profile →',
              locked: false,
            },
          ].map(card => (
            <div key={card.path} className="scene-card"
              onClick={() => {
                if (card.locked) {
                  setShowKdramaToast(true);
                  setTimeout(() => setShowKdramaToast(false), 3500);
                  return;
                }
                navigate(card.path);
              }}
              style={{
                background: isDark
                  ? `linear-gradient(135deg,${card.color}06,rgba(8,8,26,0))`
                  : `linear-gradient(135deg,${card.color}08,rgba(255,255,255,0.5))`,
                border: `1px solid ${card.color}22`, borderRadius: '20px',
                padding: '28px', cursor: card.locked ? 'not-allowed' : 'pointer',
                position: 'relative', overflow: 'hidden',
                opacity: card.locked ? 0.7 : 1,
                boxShadow: isDark ? 'none' : `0 2px 12px ${card.color}08`,
              }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: `${card.color}06`, filter: 'blur(30px)' }} />

              {/* Lock overlay */}
              {card.locked && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  padding: '4px 10px', borderRadius: '8px',
                  background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)',
                  fontSize: '10px', fontWeight: '700', color: '#e94560',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  🔒 ADVANCED ONLY
                </div>
              )}

              <div style={{ fontSize: '44px', marginBottom: '14px' }}>{card.icon}</div>
              <div style={{ fontSize: '11px', color: card.color, fontWeight: '700', letterSpacing: '2px', marginBottom: '6px' }}>{card.tag}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', fontFamily: "'Syne',sans-serif", marginBottom: '8px', color: textPrimary }}>{card.title}</div>
              <div style={{ fontSize: '13px', color: textMuted, lineHeight: 1.6, marginBottom: '16px' }}>{card.desc}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {card.chips.map(t => (
                  <span key={t} style={{ fontSize: '11px', padding: '3px 10px', background: `${card.color}10`, border: `1px solid ${card.color}22`, borderRadius: '8px', color: card.color, fontWeight: '700' }}>{t}</span>
                ))}
              </div>
              <div style={{ color: card.locked ? textDim : card.color, fontSize: '14px', fontWeight: '800' }}>{card.cta}</div>

              {/* XP progress bar for locked K-Drama card */}
              {card.locked && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min((userXP / 1000) * 100, 99)}%`, height: '100%',
                      background: 'linear-gradient(90deg, #e94560, #fb923c)',
                      borderRadius: '2px', transition: 'width 1s ease',
                    }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED SCENES ──────────────────────────────────────────────── */}
      <section style={{ background: sectionBg, borderTop: `1px solid ${sectionBorder}`, borderBottom: `1px solid ${sectionBorder}`, padding: '48px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#e94560', fontWeight: '700', letterSpacing: '3px', marginBottom: '6px' }}>FEATURED SCENES</div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', fontFamily: "'Syne',sans-serif", margin: 0, color: textPrimary }}>Start with these</h2>
            </div>
            <button onClick={() => navigate('/learn')}
              style={{ padding: '9px 20px', background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '10px', color: textMuted, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
              View All 10 Scenes →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '12px' }}>
            {FEATURED_SCENES.map((s, i) => (
              <div key={i} className="scene-card"
                onClick={() => navigate(s.route)}
                style={{
                  background: isDark
                    ? `linear-gradient(135deg,${s.color}08,rgba(8,8,26,0))`
                    : `linear-gradient(135deg,${s.color}06,rgba(255,255,255,0.6))`,
                  border: `1px solid ${s.color}28`, borderRadius: '16px', padding: '20px', cursor: 'pointer',
                  boxShadow: isDark ? 'none' : `0 2px 8px ${s.color}08`,
                }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{s.emoji}</div>
                <div style={{ fontSize: '10px', color: s.color, fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>{s.level.toUpperCase()}</div>
                <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: "'Syne',sans-serif", marginBottom: '6px', color: isDark ? '#eee' : '#222' }}>{s.title}</div>
                <div style={{ fontSize: '18px', color: s.color, fontWeight: '900', fontFamily: "'Syne',sans-serif", marginBottom: '10px', cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); speakKorean(s.scene); }}>
                  {s.scene}
                </div>
                <div style={{ fontSize: '11px', color: textDim }}>🔊 Click Korean to hear it</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 32px' }}>
        <div style={{ fontSize: '11px', color: '#e94560', fontWeight: '700', letterSpacing: '3px', marginBottom: '12px', textAlign: 'center' }}>HOW IT WORKS</div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', textAlign: 'center', fontFamily: "'Syne',sans-serif", margin: '0 0 36px', color: textPrimary }}>
          Unlike any Korean app you've tried
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
          {[
            { step: '01', icon: '🎬', title: 'Pick a Scene', desc: 'Choose from 10 real K-Drama clips with actual dialogue scripts' },
            { step: '02', icon: '📜', title: 'Read the Script', desc: 'See exact lines from the video with Korean, romanization, and meaning' },
            { step: '03', icon: '🔊', title: 'Click to Hear', desc: 'Tap any word or sentence — hear native pronunciation instantly' },
            { step: '04', icon: '🎤', title: 'Shadow & Record', desc: 'Record yourself repeating each line and compare your pronunciation' },
            { step: '05', icon: '🧩', title: 'Voice Quiz', desc: 'Hear the English meaning, say it in Korean, get scored instantly' },
            { step: '06', icon: '🎮', title: 'Play the Game', desc: 'Speak Korean commands to control your character in voice-driven missions' },
          ].map(s => (
            <div key={s.step} style={{
              background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: '16px', padding: '20px', position: 'relative',
              boxShadow: cardShadow, transition: 'background 0.4s ease',
            }}>
              <div style={{ position: 'absolute', top: '12px', right: '14px', fontSize: '10px', color: textFaint, fontWeight: '900', fontFamily: "'Syne',sans-serif" }}>{s.step}</div>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: textPrimary, fontFamily: "'Syne',sans-serif", marginBottom: '6px' }}>{s.title}</div>
              <div style={{ fontSize: '12px', color: textDim, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${sectionBorder}`, padding: '24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: '900', color: '#e94560', fontFamily: "'Syne',sans-serif", marginBottom: '6px' }}>
          🎬 CineLingo
        </div>
        <div style={{ fontSize: '12px', color: textFaint }}>
          Learn Korean through K-Dramas · Built for placement portfolio
        </div>
      </footer>
    </div>
  );
}
