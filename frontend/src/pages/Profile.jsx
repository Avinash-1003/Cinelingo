import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

const API = 'http://localhost:8081';
const tok = () => localStorage.getItem('cinelingo_token') || '';
const hdr = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok()}` });

const LEVELS = {
  beginner: { color: '#4ade80', emoji: '🌱', next: 'Intermediate', xpMax: 300 },
  intermediate: { color: '#fb923c', emoji: '⚡', next: 'Advanced', xpMax: 1000 },
  advanced: { color: '#e94560', emoji: '🏆', next: 'Legend', xpMax: 3000 },
};

const ACHS = [
  { id: 'first_word', icon: '📖', label: 'First Word', desc: 'Learned your first Korean word', check: d => d.totalWordsLearned >= 1 },
  { id: 'ten_words', icon: '🔟', label: 'Word Collector', desc: 'Learned 10 Korean words', check: d => d.totalWordsLearned >= 10 },
  { id: 'fifty_words', icon: '📚', label: 'Vocab Bank', desc: 'Learned 50 Korean words', check: d => d.totalWordsLearned >= 50 },
  { id: 'first_pron', icon: '🎤', label: 'First Attempt', desc: 'Practiced pronunciation once', check: d => d.pronunciationAttempts >= 1 },
  { id: 'good_pron', icon: '🌟', label: 'Clear Voice', desc: 'Scored 85%+ on pronunciation', check: d => d.bestScore >= 85 },
  { id: 'ten_pron', icon: '🎙', label: 'Pron. Pro', desc: '10 pronunciation attempts', check: d => d.pronunciationAttempts >= 10 },
  { id: 'first_game', icon: '🎮', label: 'Player One', desc: 'Played your first game', check: d => d.gamesPlayed >= 1 },
  { id: 'ten_games', icon: '🕹', label: 'Gamer', desc: 'Played 10 games', check: d => d.gamesPlayed >= 10 },
  { id: 'first_win', icon: '🏅', label: 'Victor', desc: 'Won your first game', check: d => d.victories >= 1 },
  { id: 'five_wins', icon: '⚔️', label: 'Warrior', desc: 'Won 5 games', check: d => d.victories >= 5 },
  { id: 'streak_3', icon: '🔥', label: 'On Fire', desc: '3-day learning streak', check: d => d.currentStreak >= 3 },
  { id: 'inter', icon: '⚡', label: 'Rising Star', desc: 'Reached Intermediate level', check: d => d.totalXp >= 300 },
  { id: 'adv', icon: '🏆', label: 'Korean Master', desc: 'Reached Advanced level', check: d => d.totalXp >= 1000 },
];

function Ring({ value, max, color, label, sub, size = 84 }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 200); return () => clearTimeout(t); }, []);
  const r = Math.floor((size - 10) / 2), circ = 2 * Math.PI * r;
  const dash = on ? Math.min(value / Math.max(max, 1), 1) * circ : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-primary, rgba(255,255,255,0.05))" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.3s ease' }} />
        <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
          fill="var(--text-primary, #fff)" fontSize="14" fontWeight="800"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}>{value}</text>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#666' }}>{label}</div>
        {sub && <div style={{ fontSize: '10px', color: '#444' }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ ach, unlocked }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', background: unlocked ? 'rgba(248,211,71,0.07)' : 'rgba(255,255,255,0.02)', border: `1px solid ${unlocked ? 'rgba(248,211,71,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '13px', padding: '15px 11px', textAlign: 'center', filter: unlocked ? 'none' : 'grayscale(1)', opacity: unlocked ? 1 : 0.38, transition: 'all 0.22s ease', transform: hov && unlocked ? 'translateY(-3px)' : 'none' }}>
      <div style={{ fontSize: '26px', marginBottom: '5px' }}>{ach.icon}</div>
      <div style={{ fontSize: '10px', fontWeight: '700', color: unlocked ? '#f8d347' : '#333', marginBottom: '3px' }}>{ach.label}</div>
      <div style={{ fontSize: '9px', color: '#333', lineHeight: 1.4 }}>{ach.desc}</div>
      {unlocked && <div style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80' }} />}
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [d, setD] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    Promise.all([
      fetch(`${API}/api/game/stats/${user.id}`, { headers: hdr() }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
      fetch(`${API}/api/users/${user.id}/streak`, { headers: hdr() }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
      fetch(`${API}/api/recommendations/progress/${user.id}`, { headers: hdr() }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
    ]).then(([gs, sk, pr]) => {
      setD({
        gamesPlayed: gs.gamesPlayed || 0,
        victories: gs.victories || 0,
        winRate: gs.winRate || 0,
        currentStreak: sk.currentStreak || user?.streak?.current || 0,
        longestStreak: sk.longestStreak || user?.streak?.longest || 0,
        totalXp: pr.totalXp || 0,
        currentLevel: pr.currentLevel || user?.proficiencyLevel || 'beginner',
        totalWordsLearned: pr.totalWordsLearned || 0,
        totalWordsPracticed: pr.totalWordsPracticed || 0,
        pronunciationAttempts: pr.totalPronunciationAttempts || 0,
        bestScore: pr.bestPronunciationScore || 0,
        avgScore: pr.averagePronunciationScore || 0,
        masteredWords: pr.masteredWordIds?.length || 0,
        strugglingWords: pr.strugglingWordIds?.length || 0,
      });
      setLoading(false);
    });
  }, [user?.id]);

  const lvl = (d.currentLevel || 'beginner').toLowerCase();
  const cfg = LEVELS[lvl] || LEVELS.beginner;
  const xpPct = Math.min(Math.round((d.totalXp || 0) / cfg.xpMax * 100), 100);
  const earned = ACHS.filter(a => a.check(d)).length;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'], bars = [0, 0, 0, 0, 0, 0, 0];
  const C = { background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.85)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '16px', padding: '22px', marginBottom: '14px', boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)', transition: 'background 0.4s ease' };
  const T = { fontSize: '11px', fontWeight: '700', color: isDark ? '#777' : '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1.2px' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: isDark ? '#08081a' : '#f5f5f7' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(233,69,96,0.15)', borderTop: '3px solid #e94560', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#08081a' : '#f5f5f7', color: isDark ? '#fff' : '#1a1a2e', fontFamily: 'system-ui,sans-serif', transition: 'background 0.4s ease, color 0.4s ease' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} @keyframes glow{0%,100%{box-shadow:0 0 22px rgba(233,69,96,0.28)}50%{box-shadow:0 0 44px rgba(233,69,96,0.55)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Hero */}
        <div style={{ ...C, background: isDark ? 'linear-gradient(135deg,rgba(233,69,96,0.07),rgba(8,8,26,0))' : 'linear-gradient(135deg,rgba(233,69,96,0.06),rgba(255,255,255,0.8))', border: '1px solid rgba(233,69,96,0.18)', animation: 'fadeUp 0.45s ease', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
            <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'linear-gradient(135deg,#e94560,#c73652)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '800', flexShrink: 0, animation: 'glow 3s ease infinite' }}>
              {user?.username?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '3px' }}>{user?.username || 'Korean Learner'}</div>
              <div style={{ fontSize: '12px', color: isDark ? '#444' : '#999', marginBottom: '10px' }}>{user?.email || ''}</div>
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `${cfg.color}18`, border: `1px solid ${cfg.color}55`, color: cfg.color }}>{cfg.emoji} {lvl.charAt(0).toUpperCase() + lvl.slice(1)}</span>
                <span style={{ padding: '3px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#888' }}>🔥 {d.currentStreak || 0} day streak</span>
                <span style={{ padding: '3px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(248,211,71,0.1)', border: '1px solid rgba(248,211,71,0.3)', color: '#f8d347' }}>⭐ {d.totalXp || 0} XP</span>
              </div>
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: isDark ? '#555' : '#888', marginBottom: '5px' }}>
                  <span>Progress to {cfg.next}</span>
                  <span style={{ color: cfg.color, fontWeight: '700' }}>{xpPct}%</span>
                </div>
                <div style={{ height: '7px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${xpPct}%`, height: '100%', background: `linear-gradient(90deg,${cfg.color},${cfg.color}88)`, borderRadius: '4px', transition: 'width 1.4s ease' }} />
                </div>
                <div style={{ fontSize: '10px', color: isDark ? '#333' : '#bbb', marginTop: '4px' }}>{lvl === 'advanced' ? '🏆 Max level!' : `${cfg.xpMax - (d.totalXp || 0)} XP to ${cfg.next}`}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
          {[['overview', '📊 Overview'], ['achievements', '🏆 Achievements'], ['stats', '📈 Stats']].map(([key, label]) => (
            <button key={key} style={{ padding: '9px 18px', background: tab === key ? 'rgba(233,69,96,0.12)' : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)', border: `1px solid ${tab === key ? 'rgba(233,69,96,0.45)' : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '10px', color: tab === key ? '#e94560' : isDark ? '#555' : '#888', fontSize: '13px', cursor: 'pointer', fontWeight: tab === key ? '700' : '600', transition: 'all 0.2s' }} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ animation: 'fadeUp 0.32s ease' }}>
            <div style={C}>
              <div style={T}>📊 Learning Stats</div>
              <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', justifyContent: 'center', padding: '8px 0' }}>
                <Ring value={d.currentStreak || 0} max={30} color="#e94560" label="Streak" sub="days" />
                <Ring value={d.gamesPlayed || 0} max={50} color="#4ade80" label="Games" sub="played" />
                <Ring value={d.victories || 0} max={Math.max(d.gamesPlayed || 10, 10)} color="#f8d347" label="Victories" sub="wins" />
                <Ring value={Math.round(d.winRate || 0)} max={100} color="#38bdf8" label="Win Rate" sub="%" />
                <Ring value={earned} max={ACHS.length} color="#a78bfa" label="Badges" sub="unlocked" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div style={C}>
                <div style={T}>📅 This Week</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '7px', padding: '14px 0 6px', justifyContent: 'center' }}>
                  {days.map((day, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '26px', height: `${Math.max(bars[i], 4)}px`, background: bars[i] > 35 ? 'linear-gradient(180deg,#e94560,#c73652)' : 'rgba(255,255,255,0.05)', borderRadius: '4px', transition: 'height 0.8s ease' }} />
                      <span style={{ fontSize: '9px', color: '#444' }}>{day}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: '#444', textAlign: 'center' }}>Active {bars.filter(h => h > 35).length} days this week</p>
              </div>
              <div style={C}>
                <div style={T}>🎯 Quick Stats</div>
                {[['🎮', 'Games Played', d.gamesPlayed || 0, '#4ade80'], ['🏆', 'Victories', d.victories || 0, '#f8d347'], ['🔥', 'Current Streak', `${d.currentStreak || 0}d`, '#e94560'], ['💪', 'Longest Streak', `${d.longestStreak || 0}d`, '#fb923c'], ['🎤', 'Pronunciation', `${d.pronunciationAttempts || 0} tries`, '#a78bfa']].map(([icon, label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>{icon} {label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={C}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ ...T, margin: 0 }}>🏆 Achievements</div>
                <span style={{ fontSize: '12px', color: '#f8d347', fontWeight: '700' }}>{earned} / {ACHS.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(105px,1fr))', gap: '9px' }}>
                {ACHS.slice(0, 6).map(a => <Badge key={a.id} ach={a} unlocked={a.check(d)} />)}
              </div>
              <button style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#e94560', fontSize: '12px', cursor: 'pointer', fontWeight: '700', padding: 0 }} onClick={() => setTab('achievements')}>See all achievements →</button>
            </div>
          </div>
        )}

        {tab === 'achievements' && (
          <div style={{ animation: 'fadeUp 0.32s ease' }}>
            <div style={C}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ ...T, margin: 0 }}>🏆 All Achievements</div>
                <span style={{ fontSize: '12px', color: '#666' }}>{earned} / {ACHS.length}</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ width: `${Math.round((earned / ACHS.length) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#f8d347,#fb923c)', borderRadius: '4px', transition: 'width 1.1s ease' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '10px' }}>
                {ACHS.map(a => <Badge key={a.id} ach={a} unlocked={a.check(d)} />)}
              </div>
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div style={{ animation: 'fadeUp 0.32s ease' }}>
            <div style={C}>
              <div style={T}>🎮 Game Performance</div>
              {[['Games Played', d.gamesPlayed || 0, 50, '#4ade80'], ['Victories', d.victories || 0, 50, '#f8d347'], ['Win Rate %', Math.round(d.winRate || 0), 100, '#38bdf8']].map(([label, val, max, color]) => (
                <div key={label} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>{label}</span>
                    <span style={{ fontSize: '13px', color, fontWeight: '700' }}>{val}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((val / max) * 100)}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={C}>
              <div style={T}>🎤 Pronunciation</div>
              {[['Attempts', d.pronunciationAttempts || 0, 50, '#a78bfa'], ['Best Score %', Math.round(d.bestScore || 0), 100, '#4ade80'], ['Avg Score %', Math.round(d.avgScore || 0), 100, '#38bdf8']].map(([label, val, max, color]) => (
                <div key={label} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>{label}</span>
                    <span style={{ fontSize: '13px', color, fontWeight: '700' }}>{val}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((val / max) * 100)}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={C}>
              <div style={T}>📖 Vocabulary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                {[['Learned', d.totalWordsLearned || 0, '#4ade80'], ['Practiced', d.totalWordsPracticed || 0, '#38bdf8'], ['Mastered', d.masteredWords || 0, '#f8d347'], ['Struggling', d.strugglingWords || 0, '#e94560'], ['Streak', `${d.currentStreak || 0}d`, '#fb923c'], ['Best Streak', `${d.longestStreak || 0}d`, '#a78bfa']].map(([label, val, color]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '800', color, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: '10px', color: '#333', marginTop: '5px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={C}>
              <div style={T}>👤 Account</div>
              {[['Username', user?.username || '—'], ['Email', user?.email || '—'], ['Learning', 'Korean 🇰🇷'], ['Level', lvl.charAt(0).toUpperCase() + lvl.slice(1)]].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '13px', color: '#444' }}>{label}</span>
                  <span style={{ fontSize: '13px', color: '#ccc', fontWeight: '600' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
