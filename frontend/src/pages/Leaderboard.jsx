import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import VoicePicker from '../components/VoicePicker';
import { speakKorean } from '../utils/voice';

const API = 'http://localhost:8081';
const tok = () => localStorage.getItem('cinelingo_token') || '';
const hdr = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` });

// ─── Drama Learning Path ─────────────────────────────────────────
const DRAMA_PATH = [
  {
    id: 'arc1', title: 'Arrive & Survive', emoji: '✈️', color: '#4ade80', unlockAt: 0,
    desc: 'Your first day in Seoul',
    scenes: ['Arriving in Seoul', 'At a Korean Restaurant', 'Getting Around Seoul'],
    vocab: [
      { korean: 'an-nyeong-ha-se-yo', english: 'Hello', romanization: 'an-nyeong-ha-se-yo' },
      { korean: 'gam-sa-ham-ni-da', english: 'Thank you', romanization: 'gam-sa-ham-ni-da' },
      { korean: 'sil-lye-ham-ni-da', english: 'Excuse me', romanization: 'sil-lye-ham-ni-da' },
      { korean: 'i-hae-ga an-dwae-yo', english: "I don't understand", romanization: 'i-hae-ga an-dwae-yo' },
      { korean: 'hwa-jang-sil-i eo-di-e-yo', english: 'Where is the bathroom?', romanization: 'hwa-jang-sil-i eo-di-e-yo' },
      { korean: 'eol-ma-ye-yo', english: 'How much is it?', romanization: 'eol-ma-ye-yo' },
    ],
  },
  {
    id: 'arc2', title: 'Daily Seoul Life', emoji: '🏙️', color: '#38bdf8', unlockAt: 6,
    desc: 'Cafés, shops, convenience stores',
    scenes: ['Shopping at Myeongdong', 'At a Korean Café', 'At a Convenience Store'],
    vocab: [
      { korean: 'ju-se-yo', english: 'Please give me', romanization: 'ju-se-yo' },
      { korean: 'ma-si-sseo-yo', english: 'It is delicious!', romanization: 'ma-si-sseo-yo' },
      { korean: 'neo-mu bi-ssa-yo', english: 'Too expensive', romanization: 'neo-mu bi-ssa-yo' },
      { korean: 'da-reun saek i-sseo-yo', english: 'Do you have another color?', romanization: 'da-reun saek i-sseo-yo' },
      { korean: 'a-i-seu a-me-ri-ka-no', english: 'Iced americano', romanization: 'a-i-seu a-me-ri-ka-no' },
      { korean: 'bong-tu ju-se-yo', english: 'A bag please', romanization: 'bong-tu ju-se-yo' },
    ],
  },
  {
    id: 'arc3', title: 'K-Drama Essentials', emoji: '📺', color: '#fb923c', unlockAt: 12,
    desc: 'Real phrases from real dramas',
    scenes: ['Made in Korea — Police Station', 'The Doctors — Old Friends Reunite'],
    vocab: [
      { korean: 'wae-yo', english: 'Why?', romanization: 'wae-yo' },
      { korean: 'a-ra-yo', english: 'Do you know?', romanization: 'a-ra-yo' },
      { korean: 'jam-kkan-man-yo', english: 'Just a moment', romanization: 'jam-kkan-man-yo' },
      { korean: 'hwa-nat-sseo-yo', english: 'I am angry', romanization: 'hwa-nat-sseo-yo' },
      { korean: 'an-dwae-yo', english: 'Not okay / Cannot', romanization: 'an-dwae-yo' },
      { korean: 'i-je-ya wa-sseo-yo', english: 'You came only now', romanization: 'i-je-ya wa-sseo-yo' },
    ],
  },
  {
    id: 'arc4', title: 'Romance & Feelings', emoji: '💕', color: '#f472b6', unlockAt: 18,
    desc: 'Emotions, confessions, K-drama hearts',
    scenes: ['Hwarang — Unexpected Confession', 'Crash Landing on You'],
    vocab: [
      { korean: 'jo-a-hae-yo', english: 'I like you', romanization: 'jo-a-hae-yo' },
      { korean: 'bo-go si-peo-yo', english: 'I miss you', romanization: 'bo-go si-peo-yo' },
      { korean: 'sa-rang-hae-yo', english: 'I love you', romanization: 'sa-rang-hae-yo' },
      { korean: 'meo-si-sseo-yo', english: 'You are cool', romanization: 'meo-si-sseo-yo' },
      { korean: 'bom haet-sal ga-ta-yo', english: 'Like spring sunshine', romanization: 'bom haet-sal ga-ta-yo' },
      { korean: 'bo-go si-peo-sseo-yo', english: 'I missed you', romanization: 'bo-go si-peo-sseo-yo' },
    ],
  },
  {
    id: 'arc5', title: 'Fluency Unlocked', emoji: '🔥', color: '#e94560', unlockAt: 24,
    desc: 'Advanced scripts — dub every line',
    scenes: ['Extraordinary Attorney Woo', 'Abyss — Detective Sketch Scene'],
    vocab: [
      { korean: 'eo-ul-lyeo-yo', english: 'It suits you', romanization: 'eo-ul-lyeo-yo' },
      { korean: 'je-dae-ro ha-se-yo', english: 'Do it properly', romanization: 'je-dae-ro ha-se-yo' },
      { korean: 'sang-gwan-eop-sseo-yo', english: "I don't care", romanization: 'sang-gwan-eop-sseo-yo' },
      { korean: 'i-reo-ke saeng-gyeo-sseo-yo', english: 'Does it look like this?', romanization: 'i-reo-ke saeng-gyeo-sseo-yo' },
      { korean: 'ja-bon-ju-ui sim-jang', english: 'Capitalist heart', romanization: 'ja-bon-ju-ui sim-jang' },
      { korean: 'seol-myeong-eul je-dae-ro', english: 'Explain properly', romanization: 'seol-myeong-eul je-dae-ro' },
    ],
  },
];

const ALL_VOCAB = DRAMA_PATH.flatMap(arc => arc.vocab.map(v => ({ ...v, arcId: arc.id, arcColor: arc.color })));

// ─── Meaning Match Game ──────────────────────────────────────────
function MeaningMatch({ vocab, onClose, accentColor, onComplete }) {
  const [pairs] = useState(() => {
    const pool = [...vocab].sort(() => Math.random() - 0.5).slice(0, 6);
    return pool;
  });
  const [leftSel, setLeftSel] = useState(null);
  const [rightSel, setRightSel] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrong, setWrong] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(null);

  const rights = useRef([...pairs].sort(() => Math.random() - 0.5));

  useEffect(() => {
    if (leftSel === null || rightSel === null) return;
    const leftWord = pairs[leftSel];
    const rightWord = rights.current[rightSel];
    if (leftWord.korean === rightWord.korean) {
      const next = new Set(matched);
      next.add(leftWord.korean);
      setMatched(next);
      setScore(s => s + 1);
      speakKorean(leftWord.romanization);
      setLeftSel(null); setRightSel(null);
      if (next.size === pairs.length) setTimeout(() => { setDone(true); if (onComplete) onComplete(next.size); }, 600);
    } else {
      setWrong({ left: leftSel, right: rightSel });
      setShake(rightSel);
      setTimeout(() => { setWrong(null); setShake(null); setLeftSel(null); setRightSel(null); }, 700);
    }
  }, [leftSel, rightSel]);

  if (done) return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: '72px', marginBottom: '12px' }}>🎉</div>
      <div style={{ fontSize: '32px', fontWeight: '900', color: accentColor, marginBottom: '8px', fontFamily: "'Syne', sans-serif" }}>Wanjyeokhaeyo!</div>
      <div style={{ fontSize: '16px', color: '#888', marginBottom: '28px' }}>All {pairs.length} pairs matched!</div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={onClose} style={btnStyle(accentColor)}>← Back to Journey</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#888' }}>Match Pronunciation ↔️ English</div>
        <div style={{ fontSize: '18px', fontWeight: '900', color: accentColor, fontFamily: "'Syne', sans-serif" }}>✅ {score}/{pairs.length}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pairs.map((p, i) => {
            const isMatched = matched.has(p.korean);
            const isSel = leftSel === i;
            const isWrong = wrong?.left === i;
            return (
              <button key={i} onClick={() => !isMatched && setLeftSel(isSel ? null : i)}
                style={{
                  padding: '14px 16px', borderRadius: '12px', border: `2px solid ${isMatched ? accentColor : isSel ? accentColor : isWrong ? '#e94560' : 'rgba(255,255,255,0.08)'}`,
                  background: isMatched ? `${accentColor}18` : isSel ? `${accentColor}15` : isWrong ? 'rgba(233,69,96,0.1)' : 'rgba(255,255,255,0.03)',
                  color: isMatched ? accentColor : '#fff', cursor: isMatched ? 'default' : 'pointer',
                  fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: '800', textAlign: 'left',
                  opacity: isMatched ? 0.5 : 1, transition: 'all .18s',
                  animation: isWrong ? 'shake .35s ease' : 'none',
                }}>
                {isMatched ? '✅ ' : ''}{p.romanization}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rights.current.map((p, i) => {
            const isMatched = matched.has(p.korean);
            const isSel = rightSel === i;
            const isWrong = wrong?.right === i;
            return (
              <button key={i} onClick={() => !isMatched && setRightSel(isSel ? null : i)}
                style={{
                  padding: '14px 16px', borderRadius: '12px', border: `2px solid ${isMatched ? accentColor : isSel ? accentColor : isWrong ? '#e94560' : 'rgba(255,255,255,0.08)'}`,
                  background: isMatched ? `${accentColor}18` : isSel ? `${accentColor}15` : isWrong ? 'rgba(233,69,96,0.1)' : 'rgba(255,255,255,0.03)',
                  color: isMatched ? accentColor : '#ccc', cursor: isMatched ? 'default' : 'pointer',
                  fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', textAlign: 'left',
                  opacity: isMatched ? 0.5 : 1, transition: 'all .18s',
                  animation: shake === i ? 'shake .35s ease' : 'none',
                }}>
                {isMatched ? '✅ ' : ''}{p.english}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Speed Quiz Game ─────────────────────────────────────────────
function SpeedQuiz({ vocab, onClose, accentColor, onComplete }) {
  const TIME = 10;
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef(null);

  const questions = useRef(
    [...vocab].sort(() => Math.random() - 0.5).slice(0, 8).map(q => {
      const wrong = [...vocab].filter(v => v.korean !== q.korean).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...wrong, q].sort(() => Math.random() - 0.5);
      return { question: q, options };
    })
  );

  const current = questions.current[qIdx];

  useEffect(() => {
    if (done || chosen !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, chosen, done]);

  const handleAnswer = useCallback((opt) => {
    clearInterval(timerRef.current);
    setChosen(opt);
    const correct = opt?.korean === current.question.korean;
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); speakKorean(current.question.romanization); }
    else { setStreak(0); }
    setTimeout(() => {
      if (qIdx + 1 >= questions.current.length) { setDone(true); if (onComplete) onComplete(score + (correct ? 1 : 0)); }
      else { setQIdx(i => i + 1); setChosen(null); setTimeLeft(TIME); }
    }, 1000);
  }, [qIdx, current]);

  if (done) {
    const pct = Math.round((score / questions.current.length) * 100);
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '12px' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '🎯' : '💪'}</div>
        <div style={{ fontSize: '32px', fontWeight: '900', color: accentColor, marginBottom: '4px', fontFamily: "'Syne', sans-serif" }}>
          {score}/{questions.current.length}
        </div>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '28px' }}>
          {pct >= 80 ? 'Wanjyeokhaeyo! You nailed it!' : pct >= 50 ? 'Jalhaesseoyo! Keep practicing!' : 'Hwaiting! You\'re getting there!'}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onClose} style={btnStyle(accentColor)}>← Back to Journey</button>
        </div>
      </div>
    );
  }

  const timerPct = (timeLeft / TIME) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: '#666' }}>Question {qIdx + 1} of {questions.current.length}</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {streak >= 2 && <span style={{ fontSize: '12px', color: '#fb923c', fontWeight: '700' }}>🔥 {streak} streak!</span>}
          <span style={{ fontSize: '16px', fontWeight: '900', color: accentColor, fontFamily: "'Syne', sans-serif" }}>⚡ {score}</span>
        </div>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{ width: `${timerPct}%`, height: '100%', borderRadius: '2px', background: timerPct > 50 ? accentColor : timerPct > 25 ? '#fb923c' : '#e94560', transition: 'width 1s linear, background .3s' }} />
      </div>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', color: '#444', fontWeight: '700', letterSpacing: '2px', marginBottom: '14px' }}>WHAT DOES THIS MEAN?</div>
        <div style={{ fontSize: '32px', fontWeight: '900', fontFamily: "'Syne', sans-serif", color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
          {current.question.romanization}
        </div>
        <button onClick={() => speakKorean(current.question.romanization)}
          style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#555', fontSize: '22px', cursor: 'pointer' }}>🔊</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {current.options.map((opt, i) => {
          const isCorrect = opt.korean === current.question.korean;
          const isChosen = chosen?.korean === opt.korean;
          const showResult = chosen !== null;
          return (
            <button key={i} onClick={() => chosen === null && handleAnswer(opt)}
              style={{
                padding: '16px', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: '700',
                cursor: chosen ? 'default' : 'pointer', textAlign: 'left',
                border: `2px solid ${showResult && isCorrect ? '#4ade80' : showResult && isChosen && !isCorrect ? '#e94560' : 'rgba(255,255,255,0.08)'}`,
                background: showResult && isCorrect ? 'rgba(74,222,128,0.15)' : showResult && isChosen && !isCorrect ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.03)',
                color: showResult && isCorrect ? '#4ade80' : showResult && isChosen && !isCorrect ? '#e94560' : '#ccc',
                transition: 'all .2s',
              }}>
              {showResult && isCorrect ? '✅ ' : showResult && isChosen && !isCorrect ? '❌ ' : ''}{opt.english}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────
const btnStyle = (color) => ({
  padding: '12px 28px', background: `linear-gradient(135deg, ${color}, ${color}aa)`,
  border: 'none', borderRadius: '12px', color: '#fff', fontSize: '14px',
  fontWeight: '800', cursor: 'pointer', fontFamily: "'Syne', sans-serif",
});

// ─── Main Component ──────────────────────────────────────────────
// ─── Persistence helpers ─────────────────────────────────────────
const JOURNEY_KEY = 'cinelingo_journey_stats';

function loadJourneyStats() {
  try {
    const s = localStorage.getItem(JOURNEY_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function saveJourneyStats(stats) {
  localStorage.setItem(JOURNEY_KEY, JSON.stringify(stats));
}

async function pushProgressToBackend(userId, addXp, addWords) {
  if (!userId || userId === 'guest') return;
  try {
    await fetch(`${API}/api/recommendations/progress/${userId}`, {
      method: 'POST', headers: hdr(),
      body: JSON.stringify({ addXp, addWordsLearned: addWords }),
    });
  } catch { /* silent */ }
}

async function pushStreakToBackend(userId) {
  if (!userId || userId === 'guest') return;
  try {
    await fetch(`${API}/api/users/${userId}/streak`, {
      method: 'PUT', headers: hdr(),
    });
  } catch { /* silent */ }
}

export default function Journey() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Load persisted stats from localStorage
  const saved = loadJourneyStats() || {};
  const [learned, setLearned] = useState(saved.learned || 0);
  const [xp, setXp] = useState(saved.xp || 0);
  const [activeGame, setActiveGame] = useState(null);
  const [selectedArc, setSelectedArc] = useState(null);
  const [hovArc, setHovArc] = useState(null);
  const [streakDays, setStreakDays] = useState(saved.streakDays || 0);
  const [dramasStudied, setDramasStudied] = useState(saved.dramasStudied || 0);
  const [scenesDone, setScenesDone] = useState(saved.scenesDone || 0);

  // Fetch real user stats from backend on mount and merge
  useEffect(() => {
    if (!user?.id || user.id === 'guest') return;
    const fetchStats = async () => {
      try {
        const [gsRes, skRes, prRes] = await Promise.all([
          fetch(`${API}/api/game/stats/${user.id}`, { headers: hdr() }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
          fetch(`${API}/api/users/${user.id}/streak`, { headers: hdr() }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
          fetch(`${API}/api/recommendations/progress/${user.id}`, { headers: hdr() }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        ]);

        const local = loadJourneyStats() || {};

        // Take the max of local vs backend for each stat
        const backendXp = (prRes.totalXp || 0) + (gsRes.victories || 0) * 50;
        const mergedXp = Math.max(local.xp || 0, backendXp);
        const mergedLearned = Math.max(local.learned || 0, prRes.totalWordsLearned || 0);
        const mergedStreak = Math.max(local.streakDays || 0, skRes.currentStreak || 0);
        const mergedScenes = Math.max(local.scenesDone || 0, Number(gsRes.gamesPlayed) || 0);

        setXp(mergedXp);
        setLearned(mergedLearned);
        setStreakDays(mergedStreak);
        setScenesDone(mergedScenes);

        saveJourneyStats({ ...local, xp: mergedXp, learned: mergedLearned, streakDays: mergedStreak, scenesDone: mergedScenes });
      } catch { /* backend offline — keep localStorage values */ }
    };
    fetchStats();
  }, [user?.id]);

  // Game completion handler — persists progress
  const handleGameComplete = useCallback((wordsCorrect, gameType) => {
    const earnedXp = gameType === 'match' ? wordsCorrect * 25 : wordsCorrect * 30;
    const newXp = xp + earnedXp;
    const newLearned = learned + wordsCorrect;
    const newScenes = scenesDone + 1;
    const newDramas = Math.min(dramasStudied + 1, DRAMA_PATH.length);

    setXp(newXp);
    setLearned(newLearned);
    setScenesDone(newScenes);
    setDramasStudied(newDramas);

    const updated = { learned: newLearned, xp: newXp, streakDays, scenesDone: newScenes, dramasStudied: newDramas };
    saveJourneyStats(updated);

    // Push to backend
    if (user?.id) {
      pushProgressToBackend(user.id, earnedXp, wordsCorrect);
      pushStreakToBackend(user.id);
    }
  }, [xp, learned, scenesDone, dramasStudied, streakDays, user?.id]);

  const stats = [
    { label: 'Words Learned', value: learned, icon: '📚', color: '#4ade80' },
    { label: 'XP Earned', value: xp.toLocaleString(), icon: '⚡', color: '#f8d347' },
    { label: 'Day Streak', value: streakDays, icon: '🔥', color: '#fb923c' },
    { label: 'Dramas Studied', value: dramasStudied, icon: '🎬', color: '#e94560' },
    { label: 'Scenes Done', value: scenesDone, icon: '✅', color: '#38bdf8' },
  ];

  const unlockedCount = DRAMA_PATH.filter(a => learned >= a.unlockAt).length;

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#07071a' : '#f5f5f7', color: isDark ? '#fff' : '#1a1a2e', fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden', transition: 'background 0.4s ease, color 0.4s ease' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes glow  { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes arcReveal { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes orb { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.1)} 100%{transform:translate(0,0) scale(1)} }
        .nav-link { font-size:13px; cursor:pointer; color:rgba(255,255,255,0.3); font-weight:600; transition:color .2s; padding:6px 0; }
        .nav-link:hover { color:rgba(255,255,255,0.7); }
        .nav-link.active { color:#e94560; }
        .arc-card { transition:all .25s ease; }
        .arc-card:hover { transform:translateY(-4px); }
        .game-btn:hover { transform:scale(1.04); }
        .game-btn:active { transform:scale(0.97); }
        .stat-card:hover { transform:translateY(-3px); }
      `}</style>

      {/* ─── NAV ─── */}
      <Navbar />

      {/* ─── GAME OVERLAY ─── */}
      {activeGame && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,7,26,0.95)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(20px)' }}>
          <div style={{ width: '100%', maxWidth: '620px', background: '#0d0d28', border: `1px solid ${activeGame.arc.color}33`, borderRadius: '24px', padding: '32px', boxShadow: `0 0 80px ${activeGame.arc.color}22` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: activeGame.arc.color, fontWeight: '700', letterSpacing: '2px', marginBottom: '4px' }}>
                  {activeGame.type === 'match' ? '🧠 MEANING MATCH' : '⚡ SPEED QUIZ'}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: "'Syne', sans-serif" }}>{activeGame.arc.emoji} {activeGame.arc.title}</div>
              </div>
              <button onClick={() => setActiveGame(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#666', fontSize: '13px', fontWeight: '700', cursor: 'pointer', padding: '8px 16px', fontFamily: 'inherit' }}>✕ Close</button>
            </div>
            {activeGame.type === 'match'
              ? <MeaningMatch vocab={activeGame.arc.vocab} onClose={() => setActiveGame(null)} accentColor={activeGame.arc.color} onComplete={(w) => handleGameComplete(w, 'match')} />
              : <SpeedQuiz vocab={activeGame.arc.vocab} onClose={() => setActiveGame(null)} accentColor={activeGame.arc.color} onComplete={(w) => handleGameComplete(w, 'speed')} />
            }
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 24px' }}>

        {/* ─── HERO ─── */}
        <div style={{ position: 'relative', marginBottom: '40px', animation: 'fadeUp .4s ease' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,69,96,0.08) 0%, transparent 70%)', animation: 'orb 8s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '20px', left: '-80px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', animation: 'orb 12s ease-in-out infinite reverse', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', position: 'relative' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: '20px', padding: '5px 16px', marginBottom: '14px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e94560', animation: 'glow 2s ease infinite' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#e94560', letterSpacing: '2px' }}>YOUR LEARNING JOURNEY</span>
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '900', fontFamily: "'Syne', sans-serif", margin: '0 0 10px', letterSpacing: '-2px', lineHeight: 1 }}>
                {user?.username || 'Learner'}'s<br />
                <span style={{ color: '#e94560' }}>K-Drama</span> Path
              </h1>
              <p style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.45)', fontSize: '15px', margin: 0, maxWidth: '420px', lineHeight: 1.6 }}>
                Watch → Learn → Play → Repeat. Your personal roadmap from Seoul survival to fluent K-Drama.
              </p>
              <div style={{ marginTop: '12px' }}>
                <VoicePicker accentColor="#e94560" isDark={isDark} />
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.12), rgba(251,146,60,0.04))', border: '1px solid rgba(251,146,60,0.3)', borderRadius: '20px', padding: '20px 28px', textAlign: 'center', animation: 'pulse 3s ease infinite' }}>
              <div style={{ fontSize: '40px', marginBottom: '4px', animation: 'float 2.5s ease infinite' }}>🔥</div>
              <div style={{ fontSize: '36px', fontWeight: '900', fontFamily: "'Syne', sans-serif", color: '#fb923c', lineHeight: 1 }}>{streakDays}</div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', fontWeight: '700', letterSpacing: '1px', marginTop: '2px' }}>DAY STREAK</div>
            </div>
          </div>
        </div>

        {/* ─── STATS STRIP ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '40px' }}>
          {stats.map(({ label, value, icon, color }) => (
            <div key={label} className="stat-card"
              style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${color}18`, borderRadius: '16px', padding: '16px 12px', textAlign: 'center', transition: 'all .2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}0d`; e.currentTarget.style.borderColor = `${color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = `${color}18`; }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color, fontFamily: "'Syne', sans-serif", marginBottom: '2px' }}>{value}</div>
              <div style={{ fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ─── XP PROGRESS BAR ─── */}
        <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '16px', padding: '20px 24px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8d347' }}>⚡ Level Progress — Level {Math.floor(xp / 500) + 1}</div>
            <div style={{ fontSize: '12px', color: '#555' }}>{xp} / {(Math.floor(xp / 500) + 1) * 500} XP</div>
          </div>
          <div style={{ height: '10px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${((xp % 500) / 500) * 100}%`, height: '100%', borderRadius: '5px', background: 'linear-gradient(90deg, #f8d347, #fb923c)', boxShadow: '0 0 12px rgba(248,211,71,0.5)', transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#444' }}>
            <span>Lv {Math.floor(xp / 500) + 1}</span>
            <span>{(Math.floor(xp / 500) + 1) * 500 - xp} XP to next level</span>
            <span>Lv {Math.floor(xp / 500) + 2}</span>
          </div>
        </div>

        {/* ─── SECTION TITLE: DRAMA PATH ─── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#e94560', fontWeight: '700', letterSpacing: '3px', marginBottom: '8px' }}>DRAMA-BASED LEARNING PATH</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', fontFamily: "'Syne', sans-serif", margin: 0, letterSpacing: '-1px' }}>
              🎬 Your Netflix-style Curriculum
            </h2>
            <div style={{ fontSize: '13px', color: '#555' }}>{unlockedCount}/{DRAMA_PATH.length} arcs unlocked</div>
          </div>
          <p style={{ color: '#555', fontSize: '13px', margin: '6px 0 0', lineHeight: 1.5 }}>
            Each arc unlocks as you learn more words. Complete mini-games to earn XP and advance your path.
          </p>
        </div>

        {/* ─── DRAMA PATH ARCS ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', position: 'relative', marginBottom: '48px' }}>
          <div style={{ position: 'absolute', left: '31px', top: '64px', bottom: '64px', width: '2px', background: 'linear-gradient(180deg, #4ade80, #38bdf8, #fb923c, #f472b6, #e94560)', opacity: 0.2, zIndex: 0 }} />

          {DRAMA_PATH.map((arc, idx) => {
            const isUnlocked = learned >= arc.unlockAt;
            const isSelected = selectedArc?.id === arc.id;
            const isHov = hovArc === arc.id;

            return (
              <div key={arc.id} style={{ animation: `arcReveal .4s ease ${idx * 0.08}s both` }}>
                <div className="arc-card"
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', borderRadius: '20px', cursor: isUnlocked ? 'pointer' : 'default', position: 'relative', zIndex: 1, marginBottom: '0', transition: 'all .22s', background: isSelected ? `${arc.color}0d` : isHov && isUnlocked ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)') : 'transparent', border: `1px solid ${isSelected ? arc.color + '35' : 'transparent'}` }}
                  onClick={() => isUnlocked && setSelectedArc(isSelected ? null : arc)}
                  onMouseEnter={() => setHovArc(arc.id)}
                  onMouseLeave={() => setHovArc(null)}>

                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: isUnlocked ? `linear-gradient(135deg, ${arc.color}55, ${arc.color}22)` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'), border: `2px solid ${isUnlocked ? arc.color : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0, boxShadow: isUnlocked ? `0 0 20px ${arc.color}30` : 'none', filter: isUnlocked ? 'none' : 'grayscale(1)', opacity: isUnlocked ? 1 : 0.4 }}>
                    {isUnlocked ? arc.emoji : '🔒'}
                  </div>

                  <div style={{ flex: 1, opacity: isUnlocked ? 1 : 0.4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: "'Syne', sans-serif", color: isUnlocked ? (isDark ? '#fff' : '#1a1a2e') : '#999' }}>{arc.title}</span>
                      {!isUnlocked && <span style={{ fontSize: '10px', color: isDark ? '#444' : '#999', fontWeight: '700', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '6px' }}>Unlock at {arc.unlockAt} words</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: isDark ? '#555' : '#888', marginBottom: '6px' }}>{arc.desc}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {arc.scenes.map(s => (
                        <span key={s} style={{ fontSize: '10px', color: isUnlocked ? arc.color : (isDark ? '#444' : '#999'), background: isUnlocked ? `${arc.color}12` : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'), border: `1px solid ${isUnlocked ? arc.color + '30' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`, borderRadius: '6px', padding: '2px 8px', fontWeight: '600' }}>📺 {s}</span>
                      ))}
                    </div>
                  </div>

                  {isUnlocked && (
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button className="game-btn" onClick={(e) => { e.stopPropagation(); setActiveGame({ type: 'match', arc }); }}
                        style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${arc.color}40`, background: `${arc.color}12`, color: arc.color, fontSize: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', whiteSpace: 'nowrap' }}>
                        🧠 Match
                      </button>
                      <button className="game-btn" onClick={(e) => { e.stopPropagation(); setActiveGame({ type: 'speed', arc }); }}
                        style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${arc.color}40`, background: `${arc.color}12`, color: arc.color, fontSize: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', whiteSpace: 'nowrap' }}>
                        ⚡ Speed
                      </button>
                      <div style={{ fontSize: '18px', color: '#333', lineHeight: '34px', marginLeft: '4px' }}>{isSelected ? '▲' : '▼'}</div>
                    </div>
                  )}
                </div>

                {/* Arc Expanded Vocab */}
                {isSelected && isUnlocked && (
                  <div style={{ margin: '4px 24px 16px 88px', background: `${arc.color}08`, border: `1px solid ${arc.color}20`, borderRadius: '16px', padding: '20px', animation: 'fadeUp .25s ease' }}>
                    <div style={{ fontSize: '11px', color: arc.color, fontWeight: '700', letterSpacing: '1.5px', marginBottom: '14px' }}>KEY VOCABULARY — CLICK TO HEAR</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                      {arc.vocab.map((v, i) => (
                        <div key={i} onClick={() => speakKorean(v.romanization)}
                          style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${arc.color}20`, borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', transition: 'all .18s' }}
                          onMouseEnter={e => e.currentTarget.style.background = `${arc.color}12`}
                          onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}>
                          {/* Romanization as the primary display — big and prominent */}
                          <div style={{ fontSize: '15px', fontWeight: '900', fontFamily: "'Syne', sans-serif", color: arc.color, marginBottom: '4px' }}>
                            {v.romanization} 🔊
                          </div>
                          {/* English meaning below */}
                          <div style={{ fontSize: '12px', color: isDark ? '#aaa' : '#555', fontWeight: '600' }}>{v.english}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="game-btn" onClick={() => setActiveGame({ type: 'match', arc })}
                        style={{ flex: 1, padding: '11px', borderRadius: '12px', border: `1px solid ${arc.color}40`, background: `${arc.color}15`, color: arc.color, fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
                        🧠 Meaning Match — All 6 words
                      </button>
                      <button className="game-btn" onClick={() => setActiveGame({ type: 'speed', arc })}
                        style={{ flex: 1, padding: '11px', borderRadius: '12px', border: `1px solid ${arc.color}40`, background: `${arc.color}15`, color: arc.color, fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
                        ⚡ Speed Quiz — 8 questions
                      </button>
                    </div>
                  </div>
                )}

                {idx < DRAMA_PATH.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '43px', height: '28px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: learned >= DRAMA_PATH[idx + 1].unlockAt ? DRAMA_PATH[idx + 1].color : (isDark ? '#222' : '#ccc'), boxShadow: learned >= DRAMA_PATH[idx + 1].unlockAt ? `0 0 8px ${DRAMA_PATH[idx + 1].color}` : 'none' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── QUICK GAMES SECTION ─── */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', letterSpacing: '3px', marginBottom: '8px' }}>QUICK PLAY</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', fontFamily: "'Syne', sans-serif", margin: '0 0 6px', letterSpacing: '-0.5px' }}>🎮 Mini-Games — All Vocab</h2>
          <p style={{ color: '#555', fontSize: '13px', margin: '0 0 20px' }}>Play across all unlocked arcs — randomized every time.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '80px', opacity: 0.06, pointerEvents: 'none' }}>🧠</div>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🧠</div>
              <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: "'Syne', sans-serif", marginBottom: '6px' }}>Meaning Match</div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px', lineHeight: 1.5 }}>Pronunciation ↔️ English tile matching. Race through all unlocked vocabulary.</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
                {['No timer', '6 pairs', 'All arcs'].map(tag => (
                  <span key={tag} style={{ fontSize: '10px', color: '#38bdf8', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>{tag}</span>
                ))}
              </div>
              <button className="game-btn" onClick={() => setActiveGame({ type: 'match', arc: { ...DRAMA_PATH[0], vocab: ALL_VOCAB.sort(() => Math.random() - 0.5).slice(0, 6), color: '#38bdf8', emoji: '🧠', title: 'Mixed Vocab' } })}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: '900', cursor: 'pointer', fontFamily: "'Syne', sans-serif", transition: 'all .2s' }}>
                Play Meaning Match →
              </button>
            </div>

            <div style={{ background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '80px', opacity: 0.06, pointerEvents: 'none' }}>⚡</div>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚡</div>
              <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: "'Syne', sans-serif", marginBottom: '6px' }}>Speed Quiz</div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px', lineHeight: 1.5 }}>Timed multiple-choice from real drama scenes. 10 seconds per question.</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
                {['10s timer', '8 questions', 'Streak bonus'].map(tag => (
                  <span key={tag} style={{ fontSize: '10px', color: '#e94560', background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.2)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>{tag}</span>
                ))}
              </div>
              <button className="game-btn" onClick={() => setActiveGame({ type: 'speed', arc: { ...DRAMA_PATH[0], vocab: ALL_VOCAB, color: '#e94560', emoji: '⚡', title: 'Mixed Vocab' } })}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #e94560, #b91c3c)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: '900', cursor: 'pointer', fontFamily: "'Syne', sans-serif", transition: 'all .2s' }}>
                Play Speed Quiz →
              </button>
            </div>
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div style={{ textAlign: 'center', background: isDark ? 'linear-gradient(135deg, rgba(233,69,96,0.07), rgba(56,189,248,0.04))' : 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(56,189,248,0.04))', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '24px', padding: '44px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(233,69,96,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '44px', marginBottom: '12px', animation: 'float 3s ease infinite' }}>🎬</div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', fontFamily: "'Syne', sans-serif", margin: '0 0 10px', letterSpacing: '-1px' }}>
            Ready to speak Korean?
          </h2>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.45)', fontSize: '14px', margin: '0 0 28px', lineHeight: 1.6 }}>
            Use everything you've learned in the voice game.<br />Speak Korean → control your character → climb the ranks.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/learn')}
              style={{ padding: '14px 36px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '14px', color: isDark ? '#fff' : '#1a1a2e', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Syne', sans-serif", transition: 'all .25s' }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}>
              📚 Continue Learning
            </button>
            <button onClick={() => navigate('/game')}
              style={{ padding: '14px 44px', background: 'linear-gradient(135deg, #e94560, #b91c3c)', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '15px', fontWeight: '900', cursor: 'pointer', fontFamily: "'Syne', sans-serif", boxShadow: '0 8px 32px rgba(233,69,96,0.4)', transition: 'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(233,69,96,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(233,69,96,0.4)'; }}>
              🎮 Play Voice Game →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}