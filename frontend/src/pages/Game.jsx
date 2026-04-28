import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const API = 'http://localhost:8081';
const tok = () => localStorage.getItem('cinelingo_token') || '';
const hdr = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` });

async function saveScore(payload) {
  try {
    await fetch(`${API}/api/scores`, { method: 'POST', headers: hdr(), body: JSON.stringify(payload) });
  } catch { /* silent */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED KOREAN VOCABULARY — 22 commands across categories
// ─────────────────────────────────────────────────────────────────────────────
const COMMANDS = [
  // Movement
  { korean: '앞으로', romanization: 'a-peu-ro', english: 'Forward', action: 'forward', icon: '⬆️', category: 'movement' },
  { korean: '뒤로', romanization: 'dwi-ro', english: 'Backward', action: 'backward', icon: '⬇️', category: 'movement' },
  { korean: '왼쪽', romanization: 'oen-jjok', english: 'Turn Left', action: 'left', icon: '⬅️', category: 'movement' },
  { korean: '오른쪽', romanization: 'o-reun-jjok', english: 'Turn Right', action: 'right', icon: '➡️', category: 'movement' },
  { korean: '달려', romanization: 'dal-lyeo', english: 'Run', action: 'run', icon: '🏃', category: 'movement' },
  { korean: '멈춰', romanization: 'meom-chwo', english: 'Stop', action: 'stop', icon: '✋', category: 'movement' },
  { korean: '점프', romanization: 'jeom-peu', english: 'Jump', action: 'jump', icon: '🦘', category: 'movement' },
  // Interaction
  { korean: '돌아봐', romanization: 'dol-a-bwa', english: 'Look Around', action: 'lookaround', icon: '👀', category: 'interaction' },
  { korean: '숨어', romanization: 'sum-eo', english: 'Hide', action: 'hide', icon: '🫥', category: 'interaction' },
  { korean: '공격해', romanization: 'gong-gyeo-kae', english: 'Attack', action: 'attack', icon: '⚔️', category: 'interaction' },
  { korean: '인사해', romanization: 'in-sa-hae', english: 'Greet', action: 'greet', icon: '🙇', category: 'interaction' },
  { korean: '가져와', romanization: 'ga-jyeo-wa', english: 'Pick Up', action: 'pickup', icon: '🤲', category: 'interaction' },
  // Environment
  { korean: '열어', romanization: 'yeol-eo', english: 'Open', action: 'open', icon: '🚪', category: 'environment' },
  { korean: '닫아', romanization: 'dad-a', english: 'Close', action: 'close', icon: '🔒', category: 'environment' },
  { korean: '빛나', romanization: 'bich-na', english: 'Illuminate', action: 'illuminate', icon: '💡', category: 'environment' },
  { korean: '조용히', romanization: 'jo-yong-hi', english: 'Be Quiet', action: 'quiet', icon: '🤫', category: 'environment' },
  // Combat
  { korean: '방어해', romanization: 'bang-eo-hae', english: 'Defend', action: 'defend', icon: '🛡️', category: 'combat' },
  { korean: '피해', romanization: 'pi-hae', english: 'Dodge', action: 'dodge', icon: '💨', category: 'combat' },
  { korean: '모여', romanization: 'mo-yeo', english: 'Rally', action: 'rally', icon: '📢', category: 'combat' },
  // Social
  { korean: '따라와', romanization: 'dda-ra-wa', english: 'Follow Me', action: 'follow', icon: '🚶', category: 'social' },
  { korean: '기다려', romanization: 'gi-da-ryeo', english: 'Wait', action: 'wait', icon: '⏳', category: 'social' },
  { korean: '도와줘', romanization: 'do-wa-jwo', english: 'Help Me', action: 'help', icon: '🆘', category: 'social' },
];

const CATEGORIES = {
  movement: { label: 'Movement', color: '#00ffcc', icon: '🏃' },
  interaction: { label: 'Interaction', color: '#ff6699', icon: '🤝' },
  environment: { label: 'Environment', color: '#ffd700', icon: '🌍' },
  combat: { label: 'Combat', color: '#ff4444', icon: '⚔️' },
  social: { label: 'Social', color: '#aa88ff', icon: '💬' },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5 DISTRICTS — each with its own missions, story, and atmosphere
// ─────────────────────────────────────────────────────────────────────────────
const DISTRICTS = [
  {
    id: 'gangnam',
    name: '강남',
    subtitle: 'Gangnam District',
    description: 'The neon-drenched heart of modern Seoul. High-rises, luxury boutiques, and underground clubs.',
    icon: '🌃',
    color: '#ff0055',
    gradient: 'linear-gradient(135deg, #ff0055, #ff6600)',
    unlockLevel: 1,
    atmosphere: 'night',
    missions: [
      {
        id: 'first_steps', title: '🚶 첫걸음', subtitle: 'First Steps',
        difficulty: 'beginner', xpReward: 100, timeLimit: 180,
        desc: 'Learn to navigate the bright streets of Gangnam. Master basic movement commands.',
        story: 'You just arrived in Seoul. The neon lights are overwhelming. A mysterious stranger beckons you forward...',
        objectives: ['Move forward through the crosswalk', 'Turn left at the convenience store', 'Turn right into the alley', 'Run to catch the last subway'],
        requiredActions: ['forward', 'left', 'right', 'run'],
        color: '#ff6b6b',
      },
      {
        id: 'midnight_delivery', title: '📦 야간 배달', subtitle: 'Midnight Delivery',
        difficulty: 'intermediate', xpReward: 250, timeLimit: 150,
        desc: 'Navigate through Gangnam at midnight to deliver a mysterious package to a hidden location.',
        story: 'The package glows faintly. The sender said only one word: "Hurry." Something is watching from the rooftops...',
        objectives: ['Sprint through traffic', 'Jump over street barriers', 'Hide from patrol drones', 'Pick up the second package'],
        requiredActions: ['run', 'jump', 'hide', 'pickup'],
        color: '#ff8844',
      },
      {
        id: 'neon_chase', title: '🚔 네온 추격전', subtitle: 'Neon Chase',
        difficulty: 'advanced', xpReward: 500, timeLimit: 120,
        desc: 'A high-speed pursuit through the electric streets — dodge, weave, and escape!',
        story: 'Sirens. Red and blue lights reflect off every surface. You didn\'t steal anything — but they think you did.',
        objectives: ['Dodge the first pursuer', 'Sprint down the main road', 'Hide in the underground', 'Defend at the bridge'],
        requiredActions: ['dodge', 'run', 'hide', 'defend'],
        color: '#ff3366',
      },
    ],
  },
  {
    id: 'hongdae',
    name: '홍대',
    subtitle: 'Hongdae District',
    description: 'The artistic soul of Seoul. Street performances, graffiti, and indie culture.',
    icon: '🎨',
    color: '#aa88ff',
    gradient: 'linear-gradient(135deg, #aa88ff, #ff88cc)',
    unlockLevel: 3,
    atmosphere: 'sunset',
    missions: [
      {
        id: 'street_performer', title: '🎸 거리 공연', subtitle: 'Street Performance',
        difficulty: 'beginner', xpReward: 150, timeLimit: 180,
        desc: 'Join the street performers! Greet the crowd, interact with artists, and follow the rhythm.',
        story: 'The crowd gathers. A guitarist plays a familiar melody. They hand you a microphone and point to the Korean lyrics...',
        objectives: ['Greet the audience', 'Follow the lead performer', 'Wave to the crowd', 'Pick up the guitar'],
        requiredActions: ['greet', 'follow', 'lookaround', 'pickup'],
        color: '#cc88ff',
      },
      {
        id: 'art_heist', title: '🖼️ 예술 작전', subtitle: 'The Art Operation',
        difficulty: 'intermediate', xpReward: 300, timeLimit: 150,
        desc: 'Infiltrate the underground art gallery to retrieve a stolen masterpiece.',
        story: 'The painting was taken from the National Museum. Intelligence says it\'s hidden behind a graffiti wall in Hongdae...',
        objectives: ['Be quiet in the gallery', 'Open the secret passage', 'Illuminate the hidden room', 'Close the vault behind you'],
        requiredActions: ['quiet', 'open', 'illuminate', 'close'],
        color: '#bb66ff',
      },
    ],
  },
  {
    id: 'myeongdong',
    name: '명동',
    subtitle: 'Myeongdong Market',
    description: 'Seoul\'s shopping paradise. Bustling markets, street food, and endless energy.',
    icon: '🛍️',
    color: '#ffd700',
    gradient: 'linear-gradient(135deg, #ffd700, #ff8c00)',
    unlockLevel: 5,
    atmosphere: 'day',
    missions: [
      {
        id: 'market_rush', title: '🏪 시장 러시', subtitle: 'Market Rush',
        difficulty: 'beginner', xpReward: 200, timeLimit: 180,
        desc: 'Race through the crowded market streets. Buy ingredients before the food stall closes!',
        story: 'Your Korean grandma needs ingredients for her famous kimchi jjigae. The market closes in 3 minutes!',
        objectives: ['Run to the first stall', 'Pick up the vegetables', 'Greet the fish vendor', 'Wait for the special discount'],
        requiredActions: ['run', 'pickup', 'greet', 'wait'],
        color: '#ffaa00',
      },
      {
        id: 'street_food_quest', title: '🍜 먹거리 탐험', subtitle: 'Street Food Quest',
        difficulty: 'intermediate', xpReward: 350, timeLimit: 150,
        desc: 'Follow the aroma of tteokbokki through winding alleys. Each vendor teaches you a new phrase.',
        story: 'Legend says the best tteokbokki in Seoul is hidden 7 alleys deep. Each alley master guards a Korean word...',
        objectives: ['Move forward into the market', 'Open the stall curtain', 'Follow the aroma trail', 'Help the lost tourist'],
        requiredActions: ['forward', 'open', 'follow', 'help'],
        color: '#ffcc33',
      },
    ],
  },
  {
    id: 'bukchon',
    name: '북촌',
    subtitle: 'Bukchon Hanok Village',
    description: 'Ancient meets modern. Traditional hanok houses under the shadow of Namsan Tower.',
    icon: '🏯',
    color: '#00ffaa',
    gradient: 'linear-gradient(135deg, #00ffaa, #00aaff)',
    unlockLevel: 8,
    atmosphere: 'dawn',
    missions: [
      {
        id: 'temple_guardian', title: '🛕 사원 수호자', subtitle: 'Temple Guardian',
        difficulty: 'intermediate', xpReward: 400, timeLimit: 150,
        desc: 'Protect the ancient temple from intruders using traditional Korean defense commands.',
        story: 'The temple bell rings at midnight. Shadows move between the hanok rooftops. You are the last guardian.',
        objectives: ['Look around for intruders', 'Defend the gate', 'Rally the other guardians', 'Attack the shadow'],
        requiredActions: ['lookaround', 'defend', 'rally', 'attack'],
        color: '#44ddaa',
      },
      {
        id: 'hanok_mystery', title: '🔍 한옥의 비밀', subtitle: 'Hanok Mystery',
        difficulty: 'advanced', xpReward: 600, timeLimit: 120,
        desc: 'Solve the ancient puzzle hidden within the oldest hanok in Bukchon — every command is a clue.',
        story: 'A 600-year-old scroll map. Its cipher can only be unlocked by speaking the correct Korean words in sequence...',
        objectives: ['Open the ancient door', 'Illuminate the scroll', 'Be quiet — listen', 'Close the final seal'],
        requiredActions: ['open', 'illuminate', 'quiet', 'close'],
        color: '#33ccaa',
      },
    ],
  },
  {
    id: 'itaewon',
    name: '이태원',
    subtitle: 'Itaewon International',
    description: 'Seoul\'s multicultural hub. Where the world meets Korea — diversity, food, and nightlife.',
    icon: '🌍',
    color: '#ff6644',
    gradient: 'linear-gradient(135deg, #ff6644, #ff2288)',
    unlockLevel: 10,
    atmosphere: 'night',
    missions: [
      {
        id: 'undercover', title: '🕵️ 잠입 작전', subtitle: 'Undercover Operation',
        difficulty: 'advanced', xpReward: 700, timeLimit: 120,
        desc: 'Go undercover in Itaewon\'s nightlife to find the informant. Use every skill you\'ve learned.',
        story: 'Agent codename: CINELINGO. Your Korean fluency is your weapon. The informant will only speak to those who know the language.',
        objectives: ['Greet the bouncer in Korean', 'Be quiet and listen', 'Follow the informant', 'Dodge the trap'],
        requiredActions: ['greet', 'quiet', 'follow', 'dodge'],
        color: '#ff5533',
      },
      {
        id: 'final_showdown', title: '🔥 최후의 결전', subtitle: 'The Final Showdown',
        difficulty: 'master', xpReward: 1000, timeLimit: 90,
        desc: 'The ultimate test. Deploy every Korean command at your disposal in rapid succession.',
        story: 'All roads led here. The Shadow Network reveals itself. Only the full power of Korean will stop them.',
        objectives: ['Rally your allies', 'Attack the leader', 'Defend the civilians', 'Help the wounded'],
        requiredActions: ['rally', 'attack', 'defend', 'help'],
        color: '#ff2222',
      },
    ],
  },
];

const DIFFICULTY_CONFIG = {
  beginner: { label: 'BEGINNER', stars: 1, color: '#4ade80' },
  intermediate: { label: 'INTERMEDIATE', stars: 2, color: '#fbbf24' },
  advanced: { label: 'ADVANCED', stars: 3, color: '#f97316' },
  master: { label: 'MASTER', stars: 4, color: '#ef4444' },
};

const ACHIEVEMENTS = [
  { id: 'first_word', title: '첫 마디', subtitle: 'First Word', desc: 'Complete your first command', icon: '🌱', xp: 50, condition: (s) => s.totalCommands >= 1 },
  { id: 'combo_3', title: '콤보 마스터', subtitle: 'Combo Master', desc: '3x combo streak', icon: '🔥', xp: 100, condition: (s) => s.maxCombo >= 3 },
  { id: 'combo_7', title: '불꽃 전사', subtitle: 'Flame Warrior', desc: '7x combo streak', icon: '🌋', xp: 250, condition: (s) => s.maxCombo >= 7 },
  { id: 'speedrunner', title: '번개', subtitle: 'Lightning', desc: 'Complete a mission under 60 seconds', icon: '⚡', xp: 300, condition: (s) => s.fastestClear < 60 },
  { id: 'perfect', title: '완벽', subtitle: 'Perfection', desc: 'Complete a mission with 0 mistakes', icon: '💎', xp: 500, condition: (s) => s.perfectRuns >= 1 },
  { id: 'polyglot_10', title: '다언어', subtitle: 'Polyglot', desc: 'Master 10 different commands', icon: '📚', xp: 200, condition: (s) => s.uniqueCommands >= 10 },
  { id: 'explorer', title: '탐험가', subtitle: 'Explorer', desc: 'Visit all 5 districts', icon: '🗺️', xp: 400, condition: (s) => s.districtsVisited >= 5 },
  { id: 'legend', title: '전설', subtitle: 'Legend', desc: 'Reach level 15', icon: '👑', xp: 1000, condition: (s) => s.level >= 15 },
];

// ─────────────────────────────────────────────────────────────────────────────
// XP & LEVELING
// ─────────────────────────────────────────────────────────────────────────────
function xpForLevel(lvl) { return Math.floor(100 * Math.pow(1.4, lvl - 1)); }
function getLevelFromXP(totalXP) {
  let lvl = 1, xpNeeded = 0;
  while (xpNeeded + xpForLevel(lvl) <= totalXP) { xpNeeded += xpForLevel(lvl); lvl++; }
  return { level: lvl, currentXP: totalXP - xpNeeded, neededXP: xpForLevel(lvl) };
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENT PLAYER STATS
// ─────────────────────────────────────────────────────────────────────────────
function loadPlayerStats() {
  try {
    const saved = localStorage.getItem('cinelingo_player_stats');
    if (saved) return JSON.parse(saved);
  } catch { }
  return {
    totalXP: 0, totalCommands: 0, maxCombo: 0, uniqueCommands: [],
    completedMissions: [], unlockedAchievements: [], perfectRuns: 0,
    fastestClear: Infinity, districtsVisited: [], totalPlayTime: 0,
    characterSkin: 0, gamesPlayed: 0,
  };
}
function savePlayerStats(stats) {
  localStorage.setItem('cinelingo_player_stats', JSON.stringify(stats));
}

// ─────────────────────────────────────────────────────────────────────────────
// FUZZY MATCH for Korean speech
// ─────────────────────────────────────────────────────────────────────────────
function fuzzyMatch(spoken, target) {
  const s = spoken.trim().toLowerCase().replace(/\s+/g, ' ');
  const t = target.trim().toLowerCase();
  if (s === t || s.includes(t) || t.includes(s)) return true;
  let matches = 0;
  for (const ch of s) { if (t.includes(ch)) matches++; }
  return (matches / Math.max(s.length, t.length)) > 0.55;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS KEYFRAMES & STYLES (injected once)
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');

  @keyframes neonPulse { 0%,100%{text-shadow:0 0 10px currentColor,0 0 30px currentColor,0 0 60px currentColor} 50%{text-shadow:0 0 5px currentColor,0 0 15px currentColor} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes gridMove { 0%{background-position:0 0} 100%{background-position:0 60px} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
  @keyframes glitch { 0%,100%{clip-path:inset(0 0 100% 0)} 20%{clip-path:inset(30% 0 50% 0)} 40%{clip-path:inset(60% 0 10% 0)} 60%{clip-path:inset(10% 0 70% 0)} 80%{clip-path:inset(80% 0 5% 0)} }
  @keyframes cardHover { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-8px) scale(1.02)} }
  @keyframes pulseGlow { 0%,100%{opacity:1} 50%{opacity:0.6} }
  @keyframes slideDown { from{transform:translateY(-30px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes slideLeft { from{transform:translateX(-30px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes slideRight { from{transform:translateX(30px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes fadeScale { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes feedbackPop { 0%{transform:translate(-50%,-50%) scale(0.8);opacity:0} 15%{transform:translate(-50%,-50%) scale(1.08);opacity:1} 75%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(1)} }
  @keyframes listenPulse { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,0,85,0.6)} 50%{transform:scale(1.06);box-shadow:0 0 0 24px rgba(255,0,85,0)} }
  @keyframes comboFlash { 0%{transform:scale(1.5)} 100%{transform:scale(1)} }
  @keyframes trophyBounce { 0%,20%,50%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-25px)} 60%{transform:translateY(-12px)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes borderGlow { 0%,100%{border-color:rgba(255,255,255,0.08)} 50%{border-color:rgba(255,255,255,0.2)} }
  @keyframes progressPulse { 0%,100%{box-shadow:0 0 4px currentColor} 50%{box-shadow:0 0 16px currentColor} }
  @keyframes orbitalSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes breathe { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.05);opacity:1} }
  @keyframes particleRise { 0%{transform:translateY(0) scale(1);opacity:0.8} 100%{transform:translateY(-60px) scale(0);opacity:0} }
  @keyframes waveBar { 0%,100%{height:4px} 50%{height:20px} }
  @keyframes revealText { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0 0 0)} }
  @keyframes screenGlitch { 0%{transform:translate(0)} 20%{transform:translate(-3px,3px)} 40%{transform:translate(3px,-3px)} 60%{transform:translate(-2px,-2px)} 80%{transform:translate(2px,2px)} 100%{transform:translate(0)} }
  @keyframes textGlow { 0%,100%{text-shadow:0 0 8px currentColor,0 0 16px currentColor} 50%{text-shadow:0 0 16px currentColor,0 0 32px currentColor,0 0 48px currentColor} }
  @keyframes subtleFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes softBounce { 0%{transform:translateY(0)} 30%{transform:translateY(-6px)} 50%{transform:translateY(0)} 70%{transform:translateY(-3px)} 100%{transform:translateY(0)} }
  @keyframes shineSlide { 0%{left:-100%} 100%{left:200%} }

  .game-root * { box-sizing: border-box; }
  .game-root { font-family: 'Inter', 'Noto Sans KR', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }

  .mission-card { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
  .mission-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 64px rgba(0,0,0,0.5) !important; }

  .district-card { transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
  .district-card:hover { transform: translateY(-6px) scale(1.015); }

  .cmd-chip { transition: all 0.25s ease; }
  .cmd-chip:hover { transform: translateY(-3px) scale(1.05); }

  .neon-btn { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; }
  .neon-btn:hover { filter: brightness(1.2); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08); }
  .neon-btn:active { transform: translateY(1px) scale(0.97); filter: brightness(0.95); transition-duration: 0.1s; }
  .neon-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%); transform:translateX(-100%); transition:transform 0.6s ease; }
  .neon-btn:hover::after { transform:translateX(100%); }

  .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(24px) saturate(1.6); -webkit-backdrop-filter: blur(24px) saturate(1.6); border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04); }
  .glass-strong { background: rgba(0,0,0,0.6); backdrop-filter: blur(28px) saturate(1.8); -webkit-backdrop-filter: blur(28px) saturate(1.8); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05); }

  .hud-panel { background: rgba(0,0,0,0.75); backdrop-filter: blur(24px) saturate(1.6); border-bottom: 1px solid rgba(255,255,255,0.06); box-shadow: 0 4px 24px rgba(0,0,0,0.4); }

  .scroll-hidden::-webkit-scrollbar { display: none; }
  .scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }

  .tooltip { position: relative; }
  .tooltip::before { content: attr(data-tip); position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); padding: 6px 12px; background: rgba(0,0,0,0.92); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; font-size: 11px; color: rgba(255,255,255,0.8); white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.2s; backdrop-filter: blur(10px); }
  .tooltip:hover::before { opacity: 1; }

  .district-card:hover .district-glow { opacity: 1; }
  .district-glow { opacity: 0; transition: opacity 0.4s ease; }

  .mission-card::before { content: ''; position: absolute; inset: 0; border-radius: 20px; background: linear-gradient(135deg, rgba(255,255,255,0.03), transparent 60%); pointer-events: none; }

  .cmd-chip:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }

  .district-card:hover { transform: translateY(-6px) scale(1.015); box-shadow: 0 20px 48px rgba(0,0,0,0.4); }

  .mission-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06) !important; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS GTA-STYLE 3D CITY GAME ENGINE (heavily enhanced)
// ─────────────────────────────────────────────────────────────────────────────
function CityGame({ onAction, playerAction, currentDistrict, onGameReady }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const playerRef = useRef(null);
  const playerStateRef = useRef({ x: 0, z: 0, angle: 0, speed: 0, jumping: false, jumpY: 0, jumpVel: 0, hidden: false, attacking: false, running: false, defending: false, dodging: false, greeting: false });
  const frameRef = useRef(null);
  const clockRef = useRef(0);
  const particlesRef = useRef([]);
  const actionQueueRef = useRef([]);
  const rainRef = useRef([]);
  const composerRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;
    let scriptEl = null;

    const loadAndInit = () => {
      // If Three.js is already loaded globally, just init
      if (window.THREE) {
        initScene();
        return;
      }
      // Check if script is already in DOM
      const existing = document.querySelector('script[src*="three.min.js"]');
      if (existing) {
        // Script tag exists but maybe still loading
        if (window.THREE) { initScene(); return; }
        existing.addEventListener('load', () => initScene(), { once: true });
        return;
      }
      // Load fresh
      scriptEl = document.createElement('script');
      scriptEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      scriptEl.crossOrigin = 'anonymous';
      scriptEl.onload = () => initScene();
      scriptEl.onerror = () => { console.warn('Three.js CDN failed, retrying...'); setTimeout(loadAndInit, 1000); };
      document.head.appendChild(scriptEl);
    };

    loadAndInit();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (currentMount && rendererRef.current.domElement.parentNode === currentMount) {
          currentMount.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }
      // Don't remove the script — keep Three.js cached globally
    };
  }, []);

  useEffect(() => {
    if (playerAction) actionQueueRef.current.push(playerAction);
  }, [playerAction]);

  const initScene = () => {
    if (!window.THREE || !mountRef.current) return;
    const THREE = window.THREE;
    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Scene ──
    const scene = new THREE.Scene();
    const districtAtmo = currentDistrict?.atmosphere || 'night';
    if (districtAtmo === 'night') {
      scene.fog = new THREE.FogExp2(0x060012, 0.014);
      scene.background = new THREE.Color(0x030008);
    } else if (districtAtmo === 'sunset') {
      scene.fog = new THREE.FogExp2(0x1a0828, 0.012);
      scene.background = new THREE.Color(0x0f0520);
    } else if (districtAtmo === 'dawn') {
      scene.fog = new THREE.FogExp2(0x081018, 0.013);
      scene.background = new THREE.Color(0x050a12);
    } else {
      scene.fog = new THREE.FogExp2(0x101828, 0.011);
      scene.background = new THREE.Color(0x0a1020);
    }
    sceneRef.current = scene;

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
    camera.position.set(0, 28, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // ── Lighting based on atmosphere ──
    const ambientLight = new THREE.AmbientLight(0x100818, 2.0);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(
      districtAtmo === 'night' ? 0x1122aa : districtAtmo === 'sunset' ? 0x884422 : 0x223344,
      0x080010, 0.6
    );
    scene.add(hemiLight);

    const moonLight = new THREE.DirectionalLight(
      districtAtmo === 'sunset' ? 0xff7744 : 0x3355aa, 0.7
    );
    moonLight.position.set(-30, 60, -20);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.set(2048, 2048);
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 200;
    const s = 80;
    moonLight.shadow.camera.left = -s;
    moonLight.shadow.camera.right = s;
    moonLight.shadow.camera.top = s;
    moonLight.shadow.camera.bottom = -s;
    scene.add(moonLight);

    // ── Build City ──
    buildCity(THREE, scene, currentDistrict);

    // ── Player ──
    const player = createPlayer(THREE);
    playerRef.current = player;
    scene.add(player);

    // ── NPCs ──
    const npcs = [];
    for (let i = 0; i < 12; i++) npcs.push(createNPC(THREE, scene, i));

    // ── Cars ──
    const cars = [];
    for (let i = 0; i < 8; i++) cars.push(createCar(THREE, scene, i));

    // ── Rain (for night atmosphere) ──
    if (districtAtmo === 'night') {
      const rainGeo = new THREE.BufferGeometry();
      const rainCount = 3000;
      const rainPositions = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * 160;
        rainPositions[i * 3 + 1] = Math.random() * 60;
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 160;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      const rainMat = new THREE.PointsMaterial({ color: 0x8899bb, size: 0.08, transparent: true, opacity: 0.4 });
      const rain = new THREE.Points(rainGeo, rainMat);
      scene.add(rain);
      rainRef.current = { mesh: rain, positions: rainPositions };
    }

    // ── Resize ──
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    if (onGameReady) onGameReady();

    // ── Animation loop ──
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      try {
        clockRef.current += 0.016;
        const t = clockRef.current;

        // Process action queue
        while (actionQueueRef.current.length > 0) {
          const act = actionQueueRef.current.shift();
          applyPlayerAction(act, playerStateRef.current, t);
        }

        // Update player
        updatePlayer(THREE, playerRef.current, playerStateRef.current, t);

        // Camera follows player
        const ps = playerStateRef.current;
        const targetCamX = ps.x + Math.sin(ps.angle) * -16;
        const targetCamZ = ps.z + Math.cos(ps.angle) * -16;
        camera.position.x += (targetCamX - camera.position.x) * 0.05;
        camera.position.z += (targetCamZ - camera.position.z) * 0.05;
        camera.position.y = 28 + ps.jumpY * 0.4 + Math.sin(t * 0.5) * 0.3;
        camera.lookAt(ps.x, 1.5 + ps.jumpY * 0.5, ps.z);

        // NPCs
        npcs.forEach((npc) => {
          if (npc?.userData) {
            npc.userData.angle = (npc.userData.angle || 0) + 0.004 * (npc.userData.speed || 1);
            const r = npc.userData.radius || 15;
            npc.position.x = npc.userData.centerX + Math.sin(npc.userData.angle) * r;
            npc.position.z = npc.userData.centerZ + Math.cos(npc.userData.angle) * r;
            npc.rotation.y = npc.userData.angle + Math.PI;
            npc.children.forEach(child => {
              if (child.name === 'leg_l') child.rotation.x = Math.sin(t * 3.5 + npc.userData.angle * 10) * 0.4;
              if (child.name === 'leg_r') child.rotation.x = -Math.sin(t * 3.5 + npc.userData.angle * 10) * 0.4;
            });
          }
        });

        // Cars
        cars.forEach((car, i) => {
          if (car?.userData) {
            car.userData.t = (car.userData.t || 0) + 0.006 * (car.userData.speed || 1);
            const r = car.userData.radius || 25;
            const nx = car.userData.centerX + Math.sin(car.userData.t) * r;
            const nz = car.userData.centerZ + Math.cos(car.userData.t) * r;
            const dx = nx - car.position.x;
            const dz = nz - car.position.z;
            car.position.x = nx;
            car.position.z = nz;
            car.rotation.y = Math.atan2(dx, dz);
            if (car.userData.light) car.userData.light.intensity = 1.5 + Math.sin(t * 15 + i) * 0.15;
          }
        });

        // Rain animation
        if (rainRef.current?.mesh) {
          const pos = rainRef.current.positions;
          for (let i = 0; i < pos.length; i += 3) {
            pos[i + 1] -= 0.5;
            if (pos[i + 1] < 0) pos[i + 1] = 55;
          }
          rainRef.current.mesh.geometry.attributes.position.needsUpdate = true;
        }

        // Particles
        particlesRef.current = particlesRef.current.filter(p => {
          if (!p?.mesh) return false;
          p.life -= 0.018;
          if (p.life <= 0) { scene.remove(p.mesh); return false; }
          p.mesh.position.x += p.vx;
          p.mesh.position.y += p.vy;
          p.mesh.position.z += p.vz;
          p.vy -= 0.018;
          if (p.mesh.material) p.mesh.material.opacity = p.life;
          p.mesh.scale.multiplyScalar(0.98);
          return true;
        });

        renderer.render(scene, camera);
      } catch (err) {
        // Silently handle Three.js render errors to prevent React error overlay
        console.warn('Render frame error:', err);
      }
    };
    animate();
  };

  const spawnParticles = (x, z, color, count = 15) => {
    if (!sceneRef.current || !window.THREE) return;
    const THREE = window.THREE;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.06 + Math.random() * 0.06, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + (Math.random() - 0.5) * 2, 0.5 + Math.random() * 1.5, z + (Math.random() - 0.5) * 2);
      sceneRef.current.add(mesh);
      particlesRef.current.push({ mesh, life: 1, vx: (Math.random() - 0.5) * 0.18, vy: Math.random() * 0.22 + 0.08, vz: (Math.random() - 0.5) * 0.18 });
    }
  };

  const spawnRingWave = (x, z, color) => {
    if (!sceneRef.current || !window.THREE) return;
    const THREE = window.THREE;
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const geo = new THREE.BoxGeometry(0.08, 0.08, 0.35);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 1, z);
      mesh.rotation.y = angle;
      sceneRef.current.add(mesh);
      particlesRef.current.push({ mesh, life: 1, vx: Math.cos(angle) * 0.28, vy: Math.random() * 0.08, vz: Math.sin(angle) * 0.28 });
    }
  };

  const applyPlayerAction = (actionObj, state, t) => {
    const action = typeof actionObj === 'object' ? actionObj.action : actionObj;
    switch (action) {
      case 'forward': state.speed = 0.18; break;
      case 'backward': state.speed = -0.12; break;
      case 'left': state.angle -= 0.35; break;
      case 'right': state.angle += 0.35; break;
      case 'run': state.speed = 0.4; state.running = true; spawnParticles(state.x, state.z, 0x00ffcc, 8); setTimeout(() => { state.running = false; }, 2500); break;
      case 'stop': state.speed = 0; state.running = false; break;
      case 'jump': if (!state.jumping) { state.jumping = true; state.jumpVel = 0.35; spawnParticles(state.x, state.z, 0xffdd00, 12); } break;
      case 'hide': state.hidden = true; spawnParticles(state.x, state.z, 0x8888ff, 10); setTimeout(() => { state.hidden = false; }, 3500); break;
      case 'attack': state.attacking = true; spawnRingWave(state.x, state.z, 0xff3333); setTimeout(() => { state.attacking = false; }, 1200); break;
      case 'lookaround': state.angle += Math.PI * 2; break;
      case 'greet': state.greeting = true; spawnParticles(state.x, state.z, 0xffaa00, 8); setTimeout(() => { state.greeting = false; }, 2000); break;
      case 'pickup': spawnParticles(state.x, state.z, 0x44ff88, 10); break;
      case 'open': spawnParticles(state.x, state.z + 1, 0xffd700, 12); break;
      case 'close': spawnParticles(state.x, state.z - 1, 0x6666ff, 8); break;
      case 'illuminate': spawnRingWave(state.x, state.z, 0xffffff); break;
      case 'quiet': spawnParticles(state.x, state.z, 0x8844ff, 6); break;
      case 'defend': state.defending = true; spawnRingWave(state.x, state.z, 0x00aaff); setTimeout(() => { state.defending = false; }, 2000); break;
      case 'dodge': state.dodging = true; state.x += Math.sin(state.angle + Math.PI / 2) * 3; spawnParticles(state.x, state.z, 0x00ffaa, 12); setTimeout(() => { state.dodging = false; }, 800); break;
      case 'rally': spawnRingWave(state.x, state.z, 0xffcc00); break;
      case 'follow': spawnParticles(state.x, state.z, 0xaa88ff, 8); break;
      case 'wait': spawnParticles(state.x, state.z, 0x8899aa, 5); break;
      case 'help': spawnRingWave(state.x, state.z, 0xff4488); break;
      default: break;
    }
  };

  const updatePlayer = (THREE, player, state, t) => {
    if (!player) return;
    state.x += Math.sin(state.angle) * state.speed;
    state.z += Math.cos(state.angle) * state.speed;
    state.speed *= 0.87;
    state.x = Math.max(-60, Math.min(60, state.x));
    state.z = Math.max(-60, Math.min(60, state.z));

    if (state.jumping) {
      state.jumpY += state.jumpVel;
      state.jumpVel -= 0.022;
      if (state.jumpY <= 0) { state.jumpY = 0; state.jumping = false; state.jumpVel = 0; }
    }

    player.position.set(state.x, state.jumpY, state.z);
    player.rotation.y = state.angle;

    const targetScale = state.hidden ? 0.3 : (state.defending ? 0.8 : 1);
    player.scale.y += (targetScale - player.scale.y) * 0.1;

    const isMoving = Math.abs(state.speed) > 0.01 || state.running;
    const legSpeed = state.running ? 9 : 4;
    player.children.forEach(child => {
      if (child.name === 'leg_l') child.rotation.x = isMoving ? Math.sin(t * legSpeed) * 0.55 : 0;
      if (child.name === 'leg_r') child.rotation.x = isMoving ? -Math.sin(t * legSpeed) * 0.55 : 0;
      if (child.name === 'arm_l') child.rotation.x = isMoving ? Math.sin(t * legSpeed + Math.PI) * 0.5 : (state.greeting ? -1.5 : 0);
      if (child.name === 'arm_r') child.rotation.x = isMoving ? -Math.sin(t * legSpeed + Math.PI) * 0.5 : (state.greeting ? -1.5 : 0);
      if (child.name === 'body') {
        child.rotation.z = isMoving ? Math.sin(t * legSpeed * 0.5) * 0.04 : 0;
        if (state.attacking) child.rotation.z = Math.sin(t * 22) * 0.2;
      }
      if (child.name === 'neon_ring') {
        child.rotation.y = t * 2.5;
        child.material.opacity = 0.55 + Math.sin(t * 4) * 0.3;
      }
      if (child.name === 'shield_ring' && state.defending) {
        child.visible = true;
        child.rotation.y = t * 3;
        child.scale.setScalar(1.2 + Math.sin(t * 6) * 0.15);
      } else if (child.name === 'shield_ring') {
        child.visible = false;
      }
    });
  };

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative', background: '#030008' }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CITY BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildCity(THREE, scene, district) {
  const districtColor = district ? parseInt(district.color.replace('#', ''), 16) : 0xff0055;

  // Ground
  const groundGeo = new THREE.PlaneGeometry(220, 220, 50, 50);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x0a0a16 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Road grid
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x161628 });
  const lanes = [-35, -17.5, 0, 17.5, 35];
  lanes.forEach(pos => {
    const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(220, 9), roadMat);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.position.set(0, 0.01, pos);
    scene.add(hRoad);
    const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(9, 220), roadMat);
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.set(pos, 0.01, 0);
    scene.add(vRoad);

    for (let j = -100; j < 100; j += 7) {
      const markMat = new THREE.MeshBasicMaterial({ color: 0xccaa00 });
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 2.5), markMat);
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(pos, 0.02, j);
      scene.add(mark);
      const mark2 = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.25), markMat);
      mark2.rotation.x = -Math.PI / 2;
      mark2.position.set(j, 0.02, pos);
      scene.add(mark2);
    }
  });

  // Crosswalks at intersections
  lanes.forEach(lx => {
    lanes.forEach(lz => {
      for (let s = 0; s < 5; s++) {
        const cwMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
        const cw = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), cwMat);
        cw.rotation.x = -Math.PI / 2;
        cw.position.set(lx - 2.5 + s * 1.3, 0.025, lz + 5);
        scene.add(cw);
      }
    });
  });

  // Buildings
  const NEON_COLORS = [0xff0055, 0x00ffcc, 0xff6600, 0x6600ff, 0x00ff66, 0xffcc00, 0xff00ff, districtColor];
  const gridCells = [-50, -35, -20, -5, 10, 25, 40, 55];

  gridCells.forEach(bx => {
    gridCells.forEach(bz => {
      const onRoadX = lanes.some(l => Math.abs(bx - l) < 7);
      const onRoadZ = lanes.some(l => Math.abs(bz - l) < 7);
      if (onRoadX || onRoadZ) return;
      if (Math.random() < 0.25) return;

      const w = 4 + Math.random() * 6;
      const d = 4 + Math.random() * 6;
      const h = 5 + Math.random() * 30;
      const color = new THREE.Color().setHSL(Math.random(), 0.08, 0.04 + Math.random() * 0.06);
      const neon = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];

      const bldGeo = new THREE.BoxGeometry(w, h, d);
      const bldMat = new THREE.MeshLambertMaterial({ color });
      const bld = new THREE.Mesh(bldGeo, bldMat);
      const ox = bx + (Math.random() - 0.5) * 4;
      const oz = bz + (Math.random() - 0.5) * 4;
      bld.position.set(ox, h / 2, oz);
      bld.castShadow = true;
      bld.receiveShadow = true;
      scene.add(bld);

      // Windows
      const rows = Math.floor(h / 2.2);
      const cols = Math.floor(w / 1.6);
      for (let wr = 0; wr < rows; wr++) {
        for (let wc = 0; wc < cols; wc++) {
          if (Math.random() < 0.55) {
            const winColor = Math.random() < 0.15 ? neon : (Math.random() < 0.3 ? 0xffeedd : 0xeedd88);
            const winMat = new THREE.MeshBasicMaterial({ color: winColor });
            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), winMat);
            win.position.set(ox - w / 2 + 0.01, 1.2 + wr * 2.2, oz - d / 2 + wc * 1.6 + 0.8);
            win.rotation.y = Math.PI / 2;
            scene.add(win);
          }
        }
      }

      // Neon accents on buildings
      if (Math.random() < 0.6) {
        const neonMat = new THREE.MeshBasicMaterial({ color: neon, transparent: true, opacity: 0.85 });
        const neonGeo = new THREE.BoxGeometry(w + 0.3, 0.25, 0.25);
        const neonSign = new THREE.Mesh(neonGeo, neonMat);
        neonSign.position.set(ox, h + 0.2, oz - d / 2);
        scene.add(neonSign);

        const nl = new THREE.PointLight(neon, 1.0, 16);
        nl.position.set(ox, h + 1.5, oz);
        scene.add(nl);
      }

      // Rooftop antenna / detail
      if (Math.random() < 0.3) {
        const antGeo = new THREE.CylinderGeometry(0.05, 0.05, 4, 4);
        const antMat = new THREE.MeshLambertMaterial({ color: 0x444466 });
        const ant = new THREE.Mesh(antGeo, antMat);
        ant.position.set(ox, h + 2, oz);
        scene.add(ant);
        const antLight = new THREE.PointLight(0xff0000, 0.5, 5);
        antLight.position.set(ox, h + 4, oz);
        scene.add(antLight);
      }
    });
  });

  // Street lights
  for (let x = -55; x <= 55; x += 14) {
    for (let z = -55; z <= 55; z += 14) {
      const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 5.5, 6);
      const poleMat = new THREE.MeshLambertMaterial({ color: 0x2a2a40 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 2.75, z);
      scene.add(pole);

      const headGeo = new THREE.BoxGeometry(0.4, 0.15, 1.0);
      const headMat = new THREE.MeshLambertMaterial({ color: 0x1a1a30 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(x, 5.6, z - 0.4);
      scene.add(head);

      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xff9955 });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), bulbMat);
      bulb.position.set(x, 5.5, z - 0.4);
      scene.add(bulb);

      const light = new THREE.PointLight(0xff8833, 1.5, 18);
      light.position.set(x, 5.3, z - 0.4);
      scene.add(light);
    }
  }

  // District-specific decorations
  if (district?.id === 'hongdae') {
    // Graffiti lights
    for (let i = 0; i < 10; i++) {
      const gl = new THREE.PointLight([0xff00ff, 0x00ff88, 0xffaa00, 0x0088ff][i % 4], 2, 12);
      gl.position.set((Math.random() - 0.5) * 80, 3, (Math.random() - 0.5) * 80);
      scene.add(gl);
    }
  }
  if (district?.id === 'bukchon') {
    // Lanterns
    for (let i = 0; i < 15; i++) {
      const lantern = new THREE.PointLight(0xff6622, 1.2, 10);
      lantern.position.set((Math.random() - 0.5) * 60, 4 + Math.random() * 3, (Math.random() - 0.5) * 60);
      scene.add(lantern);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER CHARACTER
// ─────────────────────────────────────────────────────────────────────────────
function createPlayer(THREE) {
  const group = new THREE.Group();
  const skinColor = 0xe8c8a8;
  const jacketColor = 0xcc1133;
  const pantsColor = 0x141430;

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.7, 1.0, 0.4);
  const bodyMat = new THREE.MeshLambertMaterial({ color: jacketColor });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.2;
  body.name = 'body';
  body.castShadow = true;
  group.add(body);

  // Jacket detail stripe
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xff4466 });
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.42), stripeMat);
  stripe.position.y = 1.1;
  group.add(stripe);

  // Head
  const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.5);
  const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.95;
  head.castShadow = true;
  group.add(head);

  // Hair
  const hairGeo = new THREE.BoxGeometry(0.58, 0.22, 0.54);
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x0e0e0e });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 2.19;
  group.add(hair);

  // Eyes (glowing)
  [-0.12, 0.12].forEach(offset => {
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), eyeMat);
    eye.position.set(offset, 1.95, 0.26);
    group.add(eye);
  });

  // Legs
  const legGeo = new THREE.BoxGeometry(0.28, 0.85, 0.3);
  const legMat = new THREE.MeshLambertMaterial({ color: pantsColor });
  const legL = new THREE.Mesh(legGeo, legMat); legL.position.set(-0.2, 0.42, 0); legL.name = 'leg_l'; legL.castShadow = true; group.add(legL);
  const legR = new THREE.Mesh(legGeo, legMat); legR.position.set(0.2, 0.42, 0); legR.name = 'leg_r'; legR.castShadow = true; group.add(legR);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.3, 0.15, 0.45);
  const shoeMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
  const shoeL = new THREE.Mesh(shoeGeo, shoeMat); shoeL.position.set(-0.2, 0.07, 0.06); legL.add(shoeL);
  const shoeR = new THREE.Mesh(shoeGeo, shoeMat); shoeR.position.set(0, 0.07, 0.06); legR.add(shoeR);

  // Shoe soles (neon accent)
  const soleMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
  const soleL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.45), soleMat); soleL.position.y = -0.06; shoeL.add(soleL);
  const soleR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.45), soleMat); soleR.position.y = -0.06; shoeR.add(soleR);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.22, 0.8, 0.25);
  const armMat = new THREE.MeshLambertMaterial({ color: jacketColor });
  const armL = new THREE.Mesh(armGeo, armMat); armL.position.set(-0.48, 1.1, 0); armL.name = 'arm_l'; armL.castShadow = true; group.add(armL);
  const armR = new THREE.Mesh(armGeo, armMat); armR.position.set(0.48, 1.1, 0); armR.name = 'arm_r'; armR.castShadow = true; group.add(armR);

  // Neon foot ring
  const ringGeo = new THREE.TorusGeometry(0.7, 0.035, 8, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.75 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.08;
  ring.rotation.x = Math.PI / 2;
  ring.name = 'neon_ring';
  group.add(ring);

  // Shield defense ring (hidden by default)
  const shieldGeo = new THREE.TorusGeometry(1.2, 0.08, 8, 32);
  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.5 });
  const shieldRing = new THREE.Mesh(shieldGeo, shieldMat);
  shieldRing.position.y = 1;
  shieldRing.rotation.x = Math.PI / 2;
  shieldRing.name = 'shield_ring';
  shieldRing.visible = false;
  group.add(shieldRing);

  // Player glow
  const playerLight = new THREE.PointLight(0x00ffcc, 1.8, 10);
  playerLight.position.y = 1;
  group.add(playerLight);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// NPC PEDESTRIANS
// ─────────────────────────────────────────────────────────────────────────────
function createNPC(THREE, scene, index) {
  const group = new THREE.Group();
  const colors = [0x3377ee, 0xee7733, 0x33ee77, 0xee3377, 0xeecc33, 0x33eeee, 0xee33ee, 0x999999, 0x7744cc, 0xcc4477, 0x44cc77, 0x4477cc];
  const color = colors[index % colors.length];

  const bodyGeo = new THREE.BoxGeometry(0.5, 0.8, 0.3);
  const body = new THREE.Mesh(bodyGeo, new THREE.MeshLambertMaterial({ color }));
  body.position.y = 1.1; group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.38), new THREE.MeshLambertMaterial({ color: 0xe8c8a8 }));
  head.position.y = 1.65; group.add(head);

  const legGeo = new THREE.BoxGeometry(0.2, 0.7, 0.25);
  const legMat = new THREE.MeshLambertMaterial({ color: 0x282848 });
  const legL = new THREE.Mesh(legGeo, legMat); legL.position.set(-0.15, 0.35, 0); legL.name = 'leg_l'; group.add(legL);
  const legR = new THREE.Mesh(legGeo, legMat); legR.position.set(0.15, 0.35, 0); legR.name = 'leg_r'; group.add(legR);

  const radii = [18, 22, 14, 28, 16, 20, 25, 12, 30, 19, 24, 15];
  const speeds = [1.0, 0.7, 1.3, 0.9, 1.1, 0.8, 1.2, 0.6, 0.5, 1.4, 0.75, 1.05];
  const cx = [-20, 10, -5, 25, -15, 5, 30, -30, 20, -10, 0, 35];
  const cz = [10, -20, 5, -10, 20, 30, -5, 15, -25, 0, -15, 25];

  group.userData = {
    angle: (index / 12) * Math.PI * 2,
    radius: radii[index % radii.length],
    speed: speeds[index % speeds.length],
    centerX: cx[index % cx.length],
    centerZ: cz[index % cz.length],
  };

  group.position.set(
    group.userData.centerX + Math.sin(group.userData.angle) * group.userData.radius, 0,
    group.userData.centerZ + Math.cos(group.userData.angle) * group.userData.radius
  );
  scene.add(group);
  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARS
// ─────────────────────────────────────────────────────────────────────────────
function createCar(THREE, scene, index) {
  const group = new THREE.Group();
  const carColors = [0xbb1a1a, 0x1a44bb, 0x1a9933, 0xccaa00, 0x771177, 0x115533, 0xcc5500, 0x3355aa];
  const color = carColors[index % carColors.length];

  const bodyGeo = new THREE.BoxGeometry(2.5, 0.8, 1.4);
  const body = new THREE.Mesh(bodyGeo, new THREE.MeshLambertMaterial({ color }));
  body.position.y = 0.6; group.add(body);

  const roofGeo = new THREE.BoxGeometry(1.5, 0.6, 1.2);
  const roof = new THREE.Mesh(roofGeo, new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(0.65) }));
  roof.position.set(-0.1, 1.25, 0); group.add(roof);

  // Windshield
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.6 });
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.5, 1.1), windowMat);
  windshield.position.set(0.7, 1.2, 0);
  windshield.rotation.y = Math.PI / 2;
  group.add(windshield);

  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
  [[-0.9, 0.3, 0.75], [0.9, 0.3, 0.75], [-0.9, 0.3, -0.75], [0.9, 0.3, -0.75]].forEach(([wx, wy, wz]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.x = Math.PI / 2; w.rotation.z = Math.PI / 2;
    w.position.set(wx, wy, wz); group.add(w);
  });

  const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
  const hlGeo = new THREE.BoxGeometry(0.18, 0.13, 0.28);
  [-0.4, 0.4].forEach(offset => { const hl = new THREE.Mesh(hlGeo, hlMat); hl.position.set(1.25, 0.65, offset); group.add(hl); });

  // Tail lights
  const tlMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
  const tlGeo = new THREE.BoxGeometry(0.12, 0.1, 0.25);
  [-0.4, 0.4].forEach(offset => { const tl = new THREE.Mesh(tlGeo, tlMat); tl.position.set(-1.25, 0.65, offset); group.add(tl); });

  const carLight = new THREE.SpotLight(0xffffaa, 1.5, 22, 0.4);
  carLight.position.set(1.5, 1, 0);
  carLight.target.position.set(5, 0, 0);
  group.add(carLight); group.add(carLight.target);
  group.userData.light = carLight;

  const radii = [32, 24, 38, 20, 30, 27, 35, 22];
  const speeds = [0.85, 1.15, 0.65, 1.35, 0.95, 0.75, 1.05, 1.2];
  const cx = [0, 15, -12, 8, -22, 12, -5, 20];
  const cz = [0, -15, 12, 22, 8, -12, 18, -8];

  group.userData = {
    t: index * 0.8, radius: radii[index], speed: speeds[index],
    centerX: cx[index], centerZ: cz[index], light: carLight,
  };

  group.position.set(
    group.userData.centerX + Math.sin(group.userData.t) * group.userData.radius, 0,
    group.userData.centerZ + Math.cos(group.userData.t) * group.userData.radius
  );
  scene.add(group);
  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GAME COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Game() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Screens: hub | district | playing | end | achievements | codex
  const [screen, setScreen] = useState('hub');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [playerStats, setPlayerStats] = useState(loadPlayerStats);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [timeLeft, setTimeLeft] = useState(120);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [endReason, setEndReason] = useState('');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [completedActions, setCompletedActions] = useState([]);
  const [playerAction, setPlayerAction] = useState(null);
  const [gameReady, setGameReady] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showStoryIntro, setShowStoryIntro] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewTab, setViewTab] = useState('missions'); // missions | commands
  const [elapsedTime, setElapsedTime] = useState(0);

  const recRef = useRef(null);
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(5);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const completedRef = useRef([]);
  const mistakesRef = useRef(0);

  const levelInfo = useMemo(() => getLevelFromXP(playerStats.totalXP), [playerStats.totalXP]);

  // ── Speech Rec ──
  const setupRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = 'ko-KR';
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const text = e.results[0][0].transcript.trim();
      setHeard(text);
      handleSpoken(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); setFeedback({ text: '🎤 Microphone error — Tap to retry (마이크 오류)', type: 'error' }); };
    return r;
  }, [selectedMission]);

  useEffect(() => {
    recRef.current = setupRecognition();
    return () => recRef.current?.abort();
  }, [setupRecognition]);

  // ── Timer ──
  const startTimer = (seconds) => {
    clearInterval(timerRef.current);
    clearInterval(elapsedRef.current);
    let t = seconds;
    let elapsed = 0;
    timerRef.current = setInterval(() => { t--; setTimeLeft(t); if (t <= 0) { clearInterval(timerRef.current); clearInterval(elapsedRef.current); endGame('timeout'); } }, 1000);
    elapsedRef.current = setInterval(() => { elapsed++; setElapsedTime(elapsed); }, 1000);
  };

  // ── Start Game ──
  const startGame = (mission, district) => {
    setSelectedMission(mission);
    const tl = mission?.timeLimit || 300;
    setScore(0); scoreRef.current = 0;
    setLives(5); livesRef.current = 5;
    setCombo(0); comboRef.current = 0;
    setMaxCombo(0); maxComboRef.current = 0;
    setMistakes(0); mistakesRef.current = 0;
    setCompletedActions([]); completedRef.current = [];
    setHeard(''); setFeedback(null); setEndReason('');
    setTimeLeft(tl); setElapsedTime(0);
    setGameReady(false); setNewAchievements([]);

    if (mission?.story) {
      setStoryText(mission.story);
      setShowStoryIntro(true);
      setTimeout(() => {
        setShowStoryIntro(false);
        setScreen('playing');
        setTimeout(() => startTimer(tl), 400);
      }, 4500);
    } else {
      setScreen('playing');
      setTimeout(() => startTimer(tl), 500);
    }
  };

  // ── End Game ──
  const endGame = useCallback((reason) => {
    clearInterval(timerRef.current);
    clearInterval(elapsedRef.current);
    recRef.current?.abort();
    setEndReason(reason);

    // Update stats
    const stats = { ...loadPlayerStats() };
    const xpEarned = reason === 'victory' ? (selectedMission?.xpReward || 100) + scoreRef.current : Math.floor(scoreRef.current * 0.5);
    stats.totalXP += xpEarned;
    stats.totalCommands += completedRef.current.length;
    stats.gamesPlayed += 1;
    stats.maxCombo = Math.max(stats.maxCombo, maxComboRef.current);
    stats.totalPlayTime += elapsedTime;

    completedRef.current.forEach(a => { if (!stats.uniqueCommands.includes(a)) stats.uniqueCommands.push(a); });

    if (reason === 'victory' && selectedMission) {
      if (!stats.completedMissions.includes(selectedMission.id)) stats.completedMissions.push(selectedMission.id);
      if (mistakesRef.current === 0) stats.perfectRuns += 1;
      if (elapsedTime < stats.fastestClear) stats.fastestClear = elapsedTime;
    }

    if (selectedDistrict && !stats.districtsVisited.includes(selectedDistrict.id)) {
      stats.districtsVisited.push(selectedDistrict.id);
    }

    // Check achievements
    const newAch = [];
    const statCheck = { ...stats, level: getLevelFromXP(stats.totalXP).level, uniqueCommands: stats.uniqueCommands.length, districtsVisited: stats.districtsVisited.length };
    ACHIEVEMENTS.forEach(ach => {
      if (!stats.unlockedAchievements.includes(ach.id) && ach.condition(statCheck)) {
        stats.unlockedAchievements.push(ach.id);
        stats.totalXP += ach.xp;
        newAch.push(ach);
      }
    });

    savePlayerStats(stats);
    setPlayerStats(stats);
    setNewAchievements(newAch);
    setScreen('end');

    if (user?.id) {
      saveScore({
        userId: user.id, username: user.username,
        gameMode: selectedMission?.id || 'free_roam',
        level: selectedMission?.difficulty || 'beginner',
        totalScore: scoreRef.current, livesRemaining: livesRef.current, status: reason,
      });
    }
  }, [selectedMission, selectedDistrict, user, elapsedTime]);

  // ── Handle Spoken Korean ──
  const handleSpoken = useCallback((text) => {
    const matched = COMMANDS.find(cmd => fuzzyMatch(text, cmd.korean));
    if (matched) {
      const alreadyDone = completedRef.current.includes(matched.action);
      const pts = alreadyDone ? 25 : (100 + comboRef.current * 20);
      scoreRef.current += pts;
      setScore(scoreRef.current);

      if (!alreadyDone) {
        comboRef.current++;
        setCombo(comboRef.current);
        if (comboRef.current > maxComboRef.current) { maxComboRef.current = comboRef.current; setMaxCombo(maxComboRef.current); }
        completedRef.current.push(matched.action);
        setCompletedActions([...completedRef.current]);
      }

      setLastCommand(matched);
      setPlayerAction({ action: matched.action, id: Date.now() });
      setFeedback({ text: `✅ ${matched.korean} (${matched.romanization}) — ${matched.english}! +${pts}`, type: 'success' });

      if (selectedMission) {
        const allDone = selectedMission.requiredActions.every(a => completedRef.current.includes(a));
        if (allDone) setTimeout(() => endGame('victory'), 1500);
      }
      setTimeout(() => setFeedback(null), 2200);
    } else {
      comboRef.current = 0;
      setCombo(0);
      mistakesRef.current++;
      setMistakes(mistakesRef.current);
      livesRef.current--;
      setLives(livesRef.current);
      setFeedback({ text: `❌ "${text}" — Try again! (다시 시도해보세요)`, type: 'error' });
      setTimeout(() => setFeedback(null), 2200);
      if (livesRef.current <= 0) setTimeout(() => endGame('gameover'), 1000);
    }
  }, [selectedMission, endGame]);

  const speak = () => {
    if (!recRef.current) {
      setFeedback({ text: '🎤 Speech recognition not available in this browser', type: 'error' });
      setTimeout(() => setFeedback(null), 2500);
      return;
    }
    setListening(true);
    setHeard('');
    try { recRef.current.start(); } catch { setListening(false); }
  };

  const timeColor = timeLeft > 90 ? '#4ade80' : timeLeft > 45 ? '#fbbf24' : timeLeft > 15 ? '#f97316' : '#ef4444';
  const timePercent = selectedMission ? (timeLeft / (selectedMission.timeLimit || 120)) * 100 : 100;

  // ─── STORY INTRO CINEMATIC ─────────────────────────────────────────────────
  if (showStoryIntro) {
    return (
      <div className="game-root" style={{
        minHeight: '100vh', background: '#000', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <style>{GLOBAL_STYLES}</style>
        {/* Cinematic bars */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12vh', background: '#000', zIndex: 10 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '12vh', background: '#000', zIndex: 10 }} />
        {/* Particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.3 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: '2px', height: '2px', borderRadius: '50%',
              background: selectedDistrict?.color || '#ff0055',
              animation: `particleRise ${3 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }} />
          ))}
        </div>
        <div style={{ textAlign: 'center', maxWidth: '700px', padding: '40px', zIndex: 5, animation: 'fadeIn 1s ease' }}>
          <div style={{ fontSize: '12px', letterSpacing: '6px', color: selectedMission?.color || '#ff0055', marginBottom: '16px', fontWeight: '700', animation: 'revealText 0.8s ease forwards' }}>
            {selectedMission?.difficulty?.toUpperCase()} MISSION
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '900', margin: '0 0 8px',
            fontFamily: "'Orbitron', monospace", color: '#fff', lineHeight: 1.1,
          }}>
            {selectedMission?.title}
          </h1>
          <div style={{ fontSize: '15px', color: selectedMission?.color, letterSpacing: '2px', fontWeight: '600', marginBottom: '32px' }}>
            {selectedMission?.subtitle}
          </div>
          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8,
            fontFamily: "'Noto Sans KR', sans-serif", fontStyle: 'italic',
            animation: 'fadeIn 1.5s ease 0.5s both',
          }}>
            "{storyText}"
          </p>
          <div style={{ marginTop: '40px', animation: 'fadeIn 2s ease 1.5s both' }}>
            <div style={{ fontSize: '11px', letterSpacing: '4px', color: 'rgba(255,255,255,0.3)', animation: 'pulseGlow 1.5s ease infinite' }}>
              LOADING MISSION...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── HUB / WORLD MAP ──────────────────────────────────────────────────────
  if (screen === 'hub') {
    return (
      <div className="game-root" style={{
        minHeight: '100vh', background: 'linear-gradient(145deg, #030010 0%, #0a0020 40%, #050018 100%)',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <style>{GLOBAL_STYLES}</style>
        <Navbar />

        {/* Background grid */}
        <div style={{
          position: 'fixed', inset: 0, opacity: 0.05, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(0,255,200,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px', animation: 'gridMove 5s linear infinite',
        }} />

        {/* Scanline */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(0,255,200,0.3), transparent)',
          animation: 'scanline 7s linear infinite', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Floating orbs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[
            { x: '10%', y: '20%', size: 200, color: 'rgba(255,0,85,0.06)', delay: '0s' },
            { x: '80%', y: '60%', size: 300, color: 'rgba(0,255,200,0.04)', delay: '2s' },
            { x: '50%', y: '80%', size: 250, color: 'rgba(100,60,255,0.05)', delay: '4s' },
          ].map((orb, i) => (
            <div key={i} style={{
              position: 'absolute', left: orb.x, top: orb.y,
              width: orb.size, height: orb.size, borderRadius: '50%',
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              animation: `floatSlow ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: orb.delay, filter: 'blur(40px)',
            }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px' }}>

          {/* TOP BAR — Player Level & Stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', animation: 'slideDown 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Level badge */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(255,0,85,0.2), rgba(255,100,0,0.15))',
                border: '1px solid rgba(255,0,85,0.3)', fontSize: '13px', fontWeight: '900',
                fontFamily: "'Orbitron', monospace", color: '#ff0055', position: 'relative',
              }}>
                <div style={{ fontSize: '22px' }}>{levelInfo.level}</div>
                <div style={{ position: 'absolute', bottom: -4, fontSize: '7px', letterSpacing: '2px', color: 'rgba(255,0,85,0.7)', background: '#030010', padding: '0 4px' }}>LVL</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: "'Orbitron', monospace" }}>
                  {user?.username || 'AGENT'}
                </div>
                {/* XP Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ width: '140px', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(levelInfo.currentXP / levelInfo.neededXP) * 100}%`, height: '100%', borderRadius: '3px',
                      background: 'linear-gradient(90deg, #ff0055, #ff6600)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Orbitron', monospace" }}>
                    {levelInfo.currentXP}/{levelInfo.neededXP} XP
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { label: 'HOME', icon: '🏠', action: () => navigate('/') },
                { label: 'ACHIEVEMENTS', icon: '🏆', action: () => setScreen('achievements'), count: playerStats.unlockedAchievements.length },
                { label: 'CODEX', icon: '📖', action: () => setScreen('codex'), count: playerStats.uniqueCommands.length },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action} className="neon-btn" style={{
                  padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '11px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '16px' }}>{btn.icon}</span>
                  {btn.label}
                  {btn.count !== undefined && <span style={{ background: 'rgba(255,0,85,0.2)', color: '#ff6699', padding: '2px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' }}>{btn.count}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* TITLE */}
          <div style={{ textAlign: 'center', marginBottom: '48px', animation: 'fadeIn 0.6s ease' }}>
            <div style={{ fontSize: '10px', letterSpacing: '8px', color: '#00ffcc', fontWeight: '700', marginBottom: '12px', opacity: 0.7, animation: 'textGlow 4s ease infinite' }}>
              CINELINGO · KOREAN COMMAND RPG
            </div>
            <h1 style={{
              fontSize: 'clamp(48px, 7vw, 92px)', fontWeight: '900', margin: '0 0 6px',
              fontFamily: "'Orbitron', monospace",
              background: 'linear-gradient(135deg, #ff0055 0%, #ff6600 25%, #ffdd00 50%, #00ffcc 75%, #aa88ff 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 8s ease infinite',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1, letterSpacing: '-1px',
              filter: 'drop-shadow(0 0 30px rgba(255,0,85,0.2))',
            }}>
              서울<br />
              <span style={{ fontSize: '0.42em', letterSpacing: '8px' }}>SEOUL COMMAND</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '14px 0 0', letterSpacing: '2px', maxWidth: '550px', marginInline: 'auto', lineHeight: 1.6 }}>
              SPEAK KOREAN TO COMMAND YOUR CHARACTER · EXPLORE 5 DISTRICTS · COMPLETE 12 MISSIONS
            </p>

            {/* Quick stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
              {[
                { label: 'MISSIONS', value: `${playerStats.completedMissions.length}/${DISTRICTS.reduce((a, d) => a + d.missions.length, 0)}`, color: '#ff0055' },
                { label: 'COMMANDS', value: playerStats.uniqueCommands.length, color: '#00ffcc' },
                { label: 'TOTAL XP', value: playerStats.totalXP.toLocaleString(), color: '#ffd700' },
                { label: 'GAMES', value: playerStats.gamesPlayed, color: '#aa88ff' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: stat.color, fontFamily: "'Orbitron', monospace" }}>{stat.value}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginTop: '3px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DISTRICT CARDS */}
          <div style={{ fontSize: '10px', letterSpacing: '5px', color: '#ff6600', marginBottom: '20px', fontWeight: '700' }}>
            SELECT DISTRICT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {DISTRICTS.map((district, di) => {
              const locked = levelInfo.level < district.unlockLevel;
              const visited = playerStats.districtsVisited.includes(district.id);
              const completedHere = district.missions.filter(m => playerStats.completedMissions.includes(m.id)).length;
              return (
                <div key={district.id} className="district-card" onClick={() => { if (!locked) { setSelectedDistrict(district); setScreen('district'); } }} style={{
                  background: locked ? 'rgba(255,255,255,0.02)' : `linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
                  border: `1px solid ${locked ? 'rgba(255,255,255,0.04)' : district.color + '33'}`,
                  borderRadius: '20px', padding: '24px 20px', cursor: locked ? 'not-allowed' : 'pointer',
                  opacity: locked ? 0.4 : 1, position: 'relative', overflow: 'hidden',
                  animation: `fadeScale 0.4s ease ${di * 0.08}s both`,
                }}>
                  {!locked && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${district.color}, transparent)` }} />
                  )}
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{locked ? '🔒' : district.icon}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: "'Noto Sans KR', sans-serif", marginBottom: '2px', color: '#fff' }}>{district.name}</div>
                  <div style={{ fontSize: '12px', color: district.color, fontWeight: '700', letterSpacing: '1px', marginBottom: '6px' }}>{district.subtitle}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', lineHeight: 1.5 }}>{district.description.split('.')[0]}.</div>
                  {locked ? (
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', fontWeight: '600' }}>UNLOCK AT LVL {district.unlockLevel}</div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${(completedHere / district.missions.length) * 100}%`, height: '100%', background: district.color, borderRadius: '2px', transition: 'width 0.4s' }} />
                      </div>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontFamily: "'Orbitron', monospace", fontWeight: '600' }}>{completedHere}/{district.missions.length}</span>
                    </div>
                  )}
                  {visited && !locked && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '9px', color: '#4ade80', background: 'rgba(74,222,128,0.12)', padding: '3px 8px', borderRadius: '6px', letterSpacing: '1px', fontWeight: '700' }}>VISITED</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FREE ROAM */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={() => { setSelectedDistrict(DISTRICTS[0]); startGame(null, DISTRICTS[0]); }} className="neon-btn" style={{
              padding: '16px 48px', borderRadius: '40px', border: '2px solid rgba(0,255,200,0.3)',
              background: 'rgba(0,255,200,0.04)', color: '#00ffcc', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', fontFamily: "'Orbitron', monospace", letterSpacing: '3px',
            }}>
              🌃 FREE ROAM — Open Explore (자유 탐험)
            </button>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '10px', letterSpacing: '1px' }}>
              Explore Seoul freely — practice all 22 Korean commands
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── DISTRICT VIEW (mission select) ────────────────────────────────────────
  if (screen === 'district' && selectedDistrict) {
    const district = selectedDistrict;
    return (
      <div className="game-root" style={{
        minHeight: '100vh', background: 'linear-gradient(145deg, #030010, #0a0020, #050018)',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <style>{GLOBAL_STYLES}</style>

        {/* District accent orb */}
        <div style={{
          position: 'fixed', top: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%',
          background: `radial-gradient(circle, ${district.color}12, transparent 70%)`, filter: 'blur(60px)', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '32px 24px 60px' }}>

          {/* Back button */}
          <button onClick={() => setScreen('hub')} className="neon-btn" style={{
            padding: '8px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '1px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600',
          }}>
            ← BACK TO MAP
          </button>

          {/* District Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeScale 0.4s ease' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px', animation: 'float 3s ease-in-out infinite' }}>{district.icon}</div>
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: '900', margin: '0 0 4px',
              fontFamily: "'Noto Sans KR', sans-serif", color: '#fff', lineHeight: 1,
            }}>
              {district.name}
            </h1>
            <div style={{ fontSize: '16px', color: district.color, fontWeight: '700', letterSpacing: '3px', marginBottom: '12px' }}>
              {district.subtitle.toUpperCase()}
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '500px', marginInline: 'auto', lineHeight: 1.7 }}>
              {district.description}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
            {[{ key: 'missions', label: 'MISSIONS' }, { key: 'commands', label: 'COMMAND GUIDE' }].map(tab => (
              <button key={tab.key} onClick={() => setViewTab(tab.key)} style={{
                padding: '8px 20px', borderRadius: '10px', border: 'none',
                background: viewTab === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: viewTab === tab.key ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: '700',
                cursor: 'pointer', fontFamily: "'Orbitron', monospace", letterSpacing: '2px', transition: 'all 0.2s',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {viewTab === 'missions' ? (
            /* MISSION CARDS — sequential unlock within district */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {district.missions.map((mission, mi) => {
                const isCompleted = playerStats.completedMissions.includes(mission.id);
                const diff = DIFFICULTY_CONFIG[mission.difficulty] || DIFFICULTY_CONFIG.beginner;
                // Mission gating: first mission always unlocked, rest require previous to be completed
                const prevMission = mi > 0 ? district.missions[mi - 1] : null;
                const isMissionLocked = mi > 0 && !playerStats.completedMissions.includes(prevMission.id);

                return (
                  <div key={mission.id} className="mission-card"
                    onClick={() => {
                      if (isMissionLocked) {
                        setFeedback({ text: `🔒 Complete "${prevMission.title}" first! (이전 미션을 먼저 완료하세요)`, type: 'error' });
                        setTimeout(() => setFeedback(null), 3000);
                        return;
                      }
                      startGame(mission, district);
                    }}
                    style={{
                      background: isMissionLocked
                        ? 'linear-gradient(160deg, rgba(255,255,255,0.015), rgba(255,255,255,0.005))'
                        : 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
                      border: `1px solid ${isCompleted ? 'rgba(74,222,128,0.2)' : isMissionLocked ? 'rgba(255,255,255,0.04)' : mission.color + '22'}`,
                      borderRadius: '20px', padding: '28px 32px',
                      cursor: isMissionLocked ? 'not-allowed' : 'pointer',
                      opacity: isMissionLocked ? 0.45 : 1,
                      position: 'relative', overflow: 'hidden',
                      animation: `slideRight 0.4s ease ${mi * 0.1}s both`,
                      filter: isMissionLocked ? 'grayscale(0.6)' : 'none',
                      transition: 'all 0.35s ease',
                    }}>
                    {!isMissionLocked && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${mission.color}, transparent)` }} />
                    )}

                    {/* Lock overlay badge */}
                    {isMissionLocked && (
                      <div style={{
                        position: 'absolute', top: '14px', right: '14px', zIndex: 2,
                        padding: '5px 12px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.5)',
                        display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '1px',
                      }}>
                        🔒 LOCKED
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: '800', letterSpacing: '2px', color: diff.color, background: diff.color + '18', border: `1px solid ${diff.color}33` }}>
                            {diff.label}
                          </span>
                          {'⭐'.repeat(diff.stars).split('').map((s, i) => <span key={i} style={{ fontSize: '10px' }}>⭐</span>)}
                          {isCompleted && <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '8px', fontWeight: '700', color: '#4ade80', background: 'rgba(74,222,128,0.12)', letterSpacing: '1px' }}>CLEARED ✓</span>}
                        </div>

                        <h3 style={{ margin: '0 0 3px', fontSize: '22px', fontWeight: '800', fontFamily: "'Orbitron', monospace", color: isMissionLocked ? 'rgba(255,255,255,0.4)' : '#fff' }}>
                          {mission.title}
                        </h3>
                        <div style={{ fontSize: '12px', color: isMissionLocked ? 'rgba(255,255,255,0.25)' : mission.color, fontWeight: '600', letterSpacing: '1px', marginBottom: '10px' }}>
                          {mission.subtitle}
                        </div>
                        <p style={{ fontSize: '14px', color: isMissionLocked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)', margin: '0 0 14px', lineHeight: 1.7 }}>
                          {mission.desc}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {mission.requiredActions.map(act => {
                            const cmd = COMMANDS.find(c => c.action === act);
                            const mastered = playerStats.uniqueCommands.includes(act);
                            return cmd ? (
                              <span key={act} style={{
                                padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                                background: mastered ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${mastered ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
                                color: isMissionLocked ? 'rgba(255,255,255,0.3)' : (mastered ? '#4ade80' : 'rgba(255,255,255,0.7)'),
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                              }}>
                                <span>{cmd.icon}</span>
                                <span style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{cmd.korean}</span>
                                <span style={{ fontSize: '9px', opacity: 0.45, fontStyle: 'italic', letterSpacing: '0.5px' }}>{cmd.romanization}</span>
                                <span style={{ fontSize: '10px', opacity: 0.6 }}>({cmd.english})</span>
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'rgba(255,255,255,0.25)', marginBottom: '4px' }}>REWARD</div>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: isMissionLocked ? 'rgba(255,221,0,0.3)' : '#ffd700', fontFamily: "'Orbitron', monospace" }}>
                          +{mission.xpReward}
                        </div>
                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>XP</div>
                        <div style={{ marginTop: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                          ⏱ {mission.timeLimit}s
                        </div>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '18px', padding: '10px', borderRadius: '12px',
                      background: isMissionLocked ? 'rgba(255,255,255,0.02)' : `${mission.color}0c`,
                      border: `1px solid ${isMissionLocked ? 'rgba(255,255,255,0.04)' : mission.color + '22'}`,
                      textAlign: 'center', fontSize: '12px', fontWeight: '700',
                      color: isMissionLocked ? 'rgba(255,255,255,0.3)' : mission.color,
                      letterSpacing: isMissionLocked ? '1px' : '3px',
                      fontFamily: "'Orbitron', monospace",
                    }}>
                      {isMissionLocked
                        ? `🔒 COMPLETE "${prevMission.subtitle}" FIRST`
                        : isCompleted ? 'REPLAY MISSION →' : 'START MISSION →'}
                    </div>
                  </div>
                );
              })}

              {/* Free roam in this district */}
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button onClick={() => startGame(null, district)} className="neon-btn" style={{
                  padding: '14px 40px', borderRadius: '30px', border: `1px solid ${district.color}33`,
                  background: 'transparent', color: district.color, fontSize: '12px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: "'Orbitron', monospace", letterSpacing: '2px',
                }}>
                  FREE ROAM IN {district.name} →
                </button>
              </div>
            </div>
          ) : (
            /* COMMAND GUIDE */
            <div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['all', ...Object.keys(CATEGORIES)].map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                    padding: '6px 14px', borderRadius: '8px', border: 'none',
                    background: categoryFilter === cat ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                    color: categoryFilter === cat ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontSize: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '1px', transition: 'all 0.2s',
                  }}>
                    {cat === 'all' ? '🌐 ALL' : `${CATEGORIES[cat].icon} ${CATEGORIES[cat].label.toUpperCase()}`}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                {COMMANDS.filter(cmd => categoryFilter === 'all' || cmd.category === categoryFilter).map((cmd, i) => {
                  const mastered = playerStats.uniqueCommands.includes(cmd.action);
                  const catInfo = CATEGORIES[cmd.category];
                  return (
                    <div key={i} className="cmd-chip" style={{
                      padding: '16px', borderRadius: '14px', cursor: 'default',
                      background: mastered ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${mastered ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)'}`,
                      textAlign: 'center', position: 'relative', overflow: 'hidden',
                    }}>
                      {mastered && <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '8px', color: '#4ade80' }}>✓</div>}
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{cmd.icon}</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: catInfo.color, fontFamily: "'Noto Sans KR', sans-serif" }}>{cmd.korean}</div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{cmd.romanization}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: '3px' }}>{cmd.english}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── ACHIEVEMENTS SCREEN ───────────────────────────────────────────────────
  if (screen === 'achievements') {
    return (
      <div className="game-root" style={{
        minHeight: '100vh', background: 'linear-gradient(145deg, #030010, #0a0020, #050018)',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <style>{GLOBAL_STYLES}</style>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '32px 24px 60px' }}>
          <button onClick={() => setScreen('hub')} className="neon-btn" style={{
            padding: '8px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '1px', marginBottom: '24px', fontWeight: '600',
          }}>← BACK</button>

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', fontFamily: "'Orbitron', monospace", margin: '0 0 6px' }}>ACHIEVEMENTS</h1>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px' }}>
              {playerStats.unlockedAchievements.length} / {ACHIEVEMENTS.length} UNLOCKED
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
            {ACHIEVEMENTS.map((ach, i) => {
              const unlocked = playerStats.unlockedAchievements.includes(ach.id);
              return (
                <div key={ach.id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px',
                  background: unlocked ? 'rgba(255,221,0,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${unlocked ? 'rgba(255,221,0,0.15)' : 'rgba(255,255,255,0.04)'}`,
                  opacity: unlocked ? 1 : 0.5, animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                }}>
                  <div style={{ fontSize: '32px', filter: unlocked ? 'none' : 'grayscale(1)' }}>{ach.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: "'Noto Sans KR', sans-serif" }}>{ach.title}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: unlocked ? '#ffd700' : 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{ach.subtitle}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{ach.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: unlocked ? '#ffd700' : 'rgba(255,255,255,0.2)', fontFamily: "'Orbitron', monospace" }}>+{ach.xp}</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── CODEX (command library) ───────────────────────────────────────────────
  if (screen === 'codex') {
    return (
      <div className="game-root" style={{
        minHeight: '100vh', background: 'linear-gradient(145deg, #030010, #0a0020, #050018)',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <style>{GLOBAL_STYLES}</style>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '32px 24px 60px' }}>
          <button onClick={() => setScreen('hub')} className="neon-btn" style={{
            padding: '8px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '1px', marginBottom: '24px', fontWeight: '600',
          }}>← BACK</button>

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📖</div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', fontFamily: "'Orbitron', monospace", margin: '0 0 6px' }}>KOREAN CODEX</h1>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px' }}>
              {playerStats.uniqueCommands.length} / {COMMANDS.length} COMMANDS MASTERED
            </div>
            {/* Overall progress bar */}
            <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', margin: '12px auto 0', overflow: 'hidden' }}>
              <div style={{ width: `${(playerStats.uniqueCommands.length / COMMANDS.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00ffcc, #00ff66)', borderRadius: '2px', transition: 'width 0.4s' }} />
            </div>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['all', ...Object.keys(CATEGORIES)].map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                padding: '8px 16px', borderRadius: '10px', border: 'none',
                background: categoryFilter === cat ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                color: categoryFilter === cat ? '#fff' : 'rgba(255,255,255,0.3)',
                fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '1px', transition: 'all 0.2s',
              }}>
                {cat === 'all' ? '🌐 ALL' : `${CATEGORIES[cat].icon} ${CATEGORIES[cat].label.toUpperCase()}`}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
            {COMMANDS.filter(cmd => categoryFilter === 'all' || cmd.category === categoryFilter).map((cmd, i) => {
              const mastered = playerStats.uniqueCommands.includes(cmd.action);
              const catInfo = CATEGORIES[cmd.category];
              return (
                <div key={i} className="cmd-chip" style={{
                  padding: '20px 14px', borderRadius: '16px',
                  background: mastered ? `${catInfo.color}08` : 'rgba(255,255,255,0.015)',
                  border: `1px solid ${mastered ? catInfo.color + '22' : 'rgba(255,255,255,0.04)'}`,
                  textAlign: 'center', position: 'relative',
                  animation: `fadeScale 0.3s ease ${i * 0.03}s both`,
                }}>
                  {mastered && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />}
                  <div style={{ fontSize: '28px', marginBottom: '8px', filter: mastered ? 'none' : 'grayscale(0.7) opacity(0.5)' }}>{cmd.icon}</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: mastered ? catInfo.color : 'rgba(255,255,255,0.3)', fontFamily: "'Noto Sans KR', sans-serif" }}>{cmd.korean}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '4px', letterSpacing: '1px' }}>{cmd.romanization}</div>
                  <div style={{ fontSize: '12px', color: mastered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', fontWeight: '600', marginTop: '4px' }}>{cmd.english}</div>
                  <div style={{ fontSize: '8px', color: catInfo.color, letterSpacing: '1px', marginTop: '6px', opacity: 0.6 }}>{catInfo.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAYING ───────────────────────────────────────────────────────────────
  if (screen === 'playing') {
    const mission = selectedMission;
    const district = selectedDistrict;

    return (
      <div className="game-root" style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        background: '#030008', overflow: 'hidden',
      }}>
        <style>{GLOBAL_STYLES}</style>

        {/* TOP HUD */}
        <div className="hud-panel" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', gap: '14px', flexShrink: 0, animation: 'slideDown 0.3s ease',
        }}>
          {/* Mission & district info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
            <div style={{ fontSize: '28px' }}>{district?.icon || '🌃'}</div>
            <div>
              <div style={{ fontSize: '9px', letterSpacing: '3px', color: mission?.color || district?.color || '#00ffcc', fontWeight: '700' }}>
                {mission ? `${district?.name || ''} · MISSION` : `${district?.name || 'SEOUL'} · FREE ROAM`}
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', fontFamily: "'Orbitron', monospace", lineHeight: 1.2 }}>
                {mission?.title || 'Free Roam (자유 탐험)'}
              </div>
              {mission?.subtitle && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{mission.subtitle}</div>}
            </div>
          </div>

          {/* Timer */}
          {mission && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '400px' }}>
              <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${timePercent}%`, height: '100%', borderRadius: '3px',
                  background: `linear-gradient(90deg, ${timeColor}, ${timeColor}88)`,
                  transition: 'width 1s linear, background 0.3s',
                  boxShadow: `0 0 6px ${timeColor}`,
                }} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: '900', color: timeColor, minWidth: '42px', fontFamily: "'Orbitron', monospace", textAlign: 'right' }}>
                {timeLeft}
              </span>
            </div>
          )}

          {/* Score + Lives + Combo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {combo > 1 && (
              <div style={{
                padding: '3px 12px', borderRadius: '20px', background: 'rgba(255,100,0,0.15)',
                border: '1px solid rgba(255,100,0,0.4)', color: '#ff6600', fontWeight: '900',
                fontSize: '12px', animation: 'comboFlash 0.25s ease', letterSpacing: '1px',
                fontFamily: "'Orbitron', monospace",
              }}>
                🔥 ×{combo}
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '7px', letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}>SCORE</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#ffd700', fontFamily: "'Orbitron', monospace" }}>{score}</div>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ fontSize: '14px', opacity: i < lives ? 1 : 0.12, filter: i < lives ? 'drop-shadow(0 0 3px #ff0055)' : 'none', transition: 'all 0.3s' }}>❤️</span>
              ))}
            </div>
            <button onClick={() => endGame('quit')} style={{
              padding: '5px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '10px', cursor: 'pointer',
              fontFamily: 'inherit', letterSpacing: '1px', transition: 'all 0.2s',
            }}>
              ✕
            </button>
          </div>
        </div>

        {/* MISSION OBJECTIVES */}
        {mission && (
          <div style={{
            position: 'absolute', top: '70px', left: '14px', zIndex: 10,
            borderRadius: '16px', padding: '16px 18px',
            minWidth: '210px', animation: 'slideLeft 0.4s ease 0.2s both',
          }} className="glass-strong">
            <div style={{ fontSize: '8px', letterSpacing: '3px', color: mission.color, marginBottom: '10px', fontWeight: '700' }}>
              OBJECTIVES
            </div>
            {mission.requiredActions.map((act, i) => {
              const cmd = COMMANDS.find(c => c.action === act);
              const done = completedActions.includes(act);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
                  opacity: done ? 1 : 0.6, transition: 'all 0.3s',
                }}>
                  <span style={{ fontSize: '14px', filter: done ? 'none' : 'grayscale(1)' }}>{done ? '✅' : cmd?.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: done ? '#4ade80' : '#fff', fontFamily: "'Noto Sans KR', sans-serif", transition: 'color 0.3s' }}>
                        {cmd?.korean}
                      </span>
                      <span style={{ fontSize: '11px', color: done ? 'rgba(74,222,128,0.7)' : 'rgba(255,255,255,0.5)', fontWeight: '500' }}>({cmd?.english})</span>
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{cmd?.romanization}</div>
                  </div>
                </div>
              );
            })}
            {/* Progress */}
            <div style={{ marginTop: '10px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(completedActions.filter(a => mission.requiredActions.includes(a)).length / mission.requiredActions.length) * 100}%`, height: '100%', background: mission.color, borderRadius: '2px', transition: 'width 0.4s' }} />
            </div>
          </div>
        )}

        {/* 3D GAME CANVAS */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <CityGame playerAction={playerAction} currentDistrict={selectedDistrict} onGameReady={() => setGameReady(true)} />

          {/* Cinematic vignette overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none', zIndex: 1 }} />

          {/* Loading */}
          {!gameReady && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(3,0,8,0.96)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTop: '2px solid #ff0055', borderRadius: '50%', animation: 'orbitalSpin 1s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '8px', border: '2px solid transparent', borderTop: '2px solid #00ffcc', borderRadius: '50%', animation: 'orbitalSpin 1.5s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: '16px', border: '2px solid transparent', borderTop: '2px solid #ffd700', borderRadius: '50%', animation: 'orbitalSpin 2s linear infinite' }} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#00ffcc', letterSpacing: '4px', fontFamily: "'Orbitron', monospace" }}>
                LOADING {selectedDistrict?.name || 'SEOUL'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginTop: '6px' }}>
                Generating city environment...
              </div>
            </div>
          )}

          {/* Feedback overlay */}
          {feedback && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', zIndex: 20, pointerEvents: 'none',
              animation: 'feedbackPop 2.2s ease forwards',
            }}>
              <div className="glass-strong" style={{
                padding: '18px 36px', borderRadius: '18px', fontSize: '16px', fontWeight: '800',
                fontFamily: "'Orbitron', monospace", textAlign: 'center',
                border: `1px solid ${feedback.type === 'success' ? 'rgba(74,222,128,0.5)' : 'rgba(239,68,68,0.5)'}`,
                color: feedback.type === 'success' ? '#4ade80' : '#ef4444',
                boxShadow: `0 0 40px ${feedback.type === 'success' ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                {feedback.text}
              </div>
            </div>
          )}

          {/* Last command */}
          {lastCommand && (
            <div style={{
              position: 'absolute', bottom: '110px', left: '50%', transform: 'translateX(-50%)',
              pointerEvents: 'none', animation: 'slideUp 0.3s ease',
            }} className="glass-strong">
              <div style={{ padding: '12px 24px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: '900', color: CATEGORIES[lastCommand.category]?.color || '#ff6699', fontFamily: "'Noto Sans KR', sans-serif" }}>
                  {lastCommand.korean}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>
                  {lastCommand.romanization} · {lastCommand.english}
                </div>
              </div>
            </div>
          )}

          {/* Minimap */}
          <div className="glass-strong" style={{
            position: 'absolute', bottom: '110px', right: '14px',
            width: '110px', height: '110px', borderRadius: '14px', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.25,
              backgroundImage: 'linear-gradient(rgba(0,255,200,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.5) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#ff0055', transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 8px #ff0055, 0 0 16px rgba(255,0,85,0.3)',
              animation: 'breathe 2s ease infinite',
            }} />
            <div style={{ position: 'absolute', bottom: '3px', left: 0, right: 0, textAlign: 'center', fontSize: '7px', color: 'rgba(0,255,200,0.5)', letterSpacing: '1px' }}>
              {selectedDistrict?.name || 'MAP'}
            </div>
          </div>
        </div>

        {/* BOTTOM VOICE CONTROL */}
        <div className="glass-strong" style={{
          padding: '10px 18px', flexShrink: 0, animation: 'slideUp 0.3s ease',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Heard display */}
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '10px 18px', minHeight: '48px', display: 'flex', alignItems: 'center',
            }}>
              {listening ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '24px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} style={{
                        width: '2.5px', background: '#ff0055', borderRadius: '2px',
                        animation: `waveBar ${0.4 + i * 0.06}s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', color: '#ff0055', fontWeight: '700', letterSpacing: '2px' }}>
                    LISTENING... (듣고 있어요)
                  </span>
                </div>
              ) : heard ? (
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffd700', fontFamily: "'Noto Sans KR', sans-serif" }}>
                  🎤 "{heard}"
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px' }}>
                  PRESS MIC → SPEAK KOREAN 🇰🇷
                </span>
              )}
            </div>

            {/* Mic Button */}
            <button onClick={speak} disabled={listening} style={{
              width: '58px', height: '58px', borderRadius: '50%', border: '2px solid rgba(255,0,85,0.3)',
              background: listening
                ? 'radial-gradient(circle, #ff0055, #cc0033)'
                : 'radial-gradient(circle, #ff1a3c 0%, #cc0028 50%, #880018 100%)',
              color: '#fff', fontSize: '22px', cursor: listening ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              animation: listening ? 'listenPulse 1s ease infinite' : 'none',
              transition: 'all 0.25s',
              boxShadow: listening ? '0 0 40px rgba(255,0,85,0.5), 0 0 80px rgba(255,0,85,0.2)' : '0 4px 24px rgba(255,0,85,0.35), 0 0 0 4px rgba(255,0,85,0.08)',
            }}>
              🎤
            </button>

            {/* Quick commands (scrollable) */}
            <div className="scroll-hidden" style={{ display: 'flex', gap: '5px', overflow: 'auto', maxWidth: '400px' }}>
              {(selectedMission ? COMMANDS.filter(c => selectedMission.requiredActions.includes(c.action)) : COMMANDS.slice(0, 8)).map((cmd) => {
                const done = completedActions.includes(cmd.action);
                return (
                  <button key={cmd.action} onClick={() => {
                    setLastCommand(cmd);
                    setPlayerAction({ action: cmd.action, id: Date.now() });
                  }} style={{
                    padding: '6px 10px', borderRadius: '10px', border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    background: done ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
                    color: '#fff', fontSize: '10px', fontWeight: '700', cursor: 'pointer',
                    fontFamily: 'inherit', letterSpacing: '0.5px', flexShrink: 0, transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '62px',
                  }}>
                    <span style={{ fontSize: '14px' }}>{cmd.icon}</span>
                    <span style={{ fontSize: '12px', color: done ? '#4ade80' : CATEGORIES[cmd.category]?.color || '#ff6699', fontFamily: "'Noto Sans KR', sans-serif", fontWeight: '800' }}>{cmd.korean}</span>
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: '400', fontStyle: 'italic' }}>{cmd.romanization}</span>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{cmd.english}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── END SCREEN ────────────────────────────────────────────────────────────
  if (screen === 'end') {
    const isVictory = endReason === 'victory';
    const isTimeout = endReason === 'timeout';
    const accentColor = isVictory ? '#ffd700' : isTimeout ? '#ff6600' : '#ff0055';
    const xpEarned = isVictory ? (selectedMission?.xpReward || 100) + score : Math.floor(score * 0.5);
    const perfectRun = isVictory && mistakes === 0;

    return (
      <div className="game-root" style={{
        minHeight: '100vh', background: 'linear-gradient(145deg, #030010, #0a0020)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', overflow: 'hidden',
      }}>
        <style>{GLOBAL_STYLES}</style>

        {/* Celebration particles */}
        {isVictory && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {Array.from({ length: 40 }, (_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                width: `${3 + Math.random() * 4}px`, height: `${3 + Math.random() * 4}px`, borderRadius: '50%',
                background: ['#ff0055', '#00ffcc', '#ffd700', '#aa88ff', '#ff6600'][i % 5],
                animation: `particleRise ${3 + Math.random() * 5}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`, opacity: 0.6,
              }} />
            ))}
          </div>
        )}

        <div style={{
          borderRadius: '28px', padding: '48px 44px', textAlign: 'center',
          maxWidth: '560px', width: '100%', animation: 'fadeScale 0.5s ease',
          position: 'relative', overflow: 'hidden',
        }} className="glass">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

          <div style={{ fontSize: '72px', marginBottom: '16px', animation: 'trophyBounce 1s ease 0.3s' }}>
            {isVictory ? (perfectRun ? '💎' : '🏆') : isTimeout ? '⏰' : '💀'}
          </div>

          <h2 style={{
            fontSize: '30px', fontWeight: '900', marginBottom: '6px',
            fontFamily: "'Orbitron', monospace", color: accentColor, letterSpacing: '2px',
          }}>
            {isVictory ? (perfectRun ? 'PERFECT CLEAR' : 'MISSION COMPLETE') : isTimeout ? "TIME'S UP" : 'MISSION FAILED'}
          </h2>

          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px', letterSpacing: '1px', lineHeight: 1.6 }}>
            {isVictory ? `🎉 완벽해요! ${maxCombo > 3 ? `🔥 ${maxCombo}x max combo! ` : ''}${perfectRun ? '💎 Zero mistakes — legendary!' : '잘했어요!'}` :
              isTimeout ? '⏰ 시간 초과! Practice pronunciation to be faster.' :
                '😢 괜찮아요! Every attempt makes you stronger.'}
          </p>

          {/* XP Earned */}
          <div style={{
            padding: '16px', borderRadius: '16px', marginBottom: '24px',
            background: 'rgba(255,221,0,0.04)', border: '1px solid rgba(255,221,0,0.12)',
          }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>XP EARNED</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#ffd700', fontFamily: "'Orbitron', monospace" }}>+{xpEarned}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
              Level {levelInfo.level} · {levelInfo.currentXP}/{levelInfo.neededXP} XP to next
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', overflow: 'hidden', marginBottom: '24px',
          }}>
            {[
              { label: 'SCORE', value: score, color: '#ffd700' },
              { label: 'COMMANDS', value: completedActions.length, color: '#00ffcc' },
              { label: 'MAX COMBO', value: maxCombo, color: '#ff6600' },
              { label: 'TIME', value: `${elapsedTime}s`, color: '#aa88ff' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '16px 10px' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color, fontFamily: "'Orbitron', monospace" }}>{stat.value}</div>
                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', marginTop: '3px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* New achievements */}
          {newAchievements.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#ffd700', marginBottom: '10px', fontWeight: '700' }}>
                🏆 NEW ACHIEVEMENTS UNLOCKED
              </div>
              {newAchievements.map(ach => (
                <div key={ach.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                  background: 'rgba(255,221,0,0.05)', border: '1px solid rgba(255,221,0,0.12)',
                  borderRadius: '10px', marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '24px' }}>{ach.icon}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: "'Noto Sans KR', sans-serif" }}>{ach.title}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{ach.desc}</div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#ffd700', fontFamily: "'Orbitron', monospace" }}>+{ach.xp}</div>
                </div>
              ))}
            </div>
          )}

          {/* Korean mastered */}
          {completedActions.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(255,255,255,0.25)', marginBottom: '10px' }}>KOREAN USED</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {completedActions.map(act => {
                  const cmd = COMMANDS.find(c => c.action === act);
                  return cmd ? (
                    <span key={act} style={{
                      padding: '6px 14px', borderRadius: '10px',
                      background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
                      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
                    }}>
                      <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: '700', fontFamily: "'Noto Sans KR', sans-serif" }}>{cmd.korean}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: '500', fontStyle: 'italic' }}>{cmd.romanization}</span>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: '🔄 RETRY', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', action: () => { if (selectedMission) startGame(selectedMission, selectedDistrict); else startGame(null, selectedDistrict); } },
              { label: '🗺️ MAP', color: '#00ffcc', bg: 'rgba(0,255,200,0.04)', border: 'rgba(0,255,200,0.15)', action: () => setScreen('hub') },
              { label: '🏆 BOARD', color: '#ffd700', bg: 'rgba(255,221,0,0.04)', border: 'rgba(255,221,0,0.15)', action: () => navigate('/leaderboard') },
              { label: '📖 LEARN', color: '#aa88ff', bg: 'rgba(170,136,255,0.04)', border: 'rgba(170,136,255,0.15)', action: () => navigate('/learn') },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} className="neon-btn" style={{
                padding: '11px 20px', background: btn.bg, border: `1px solid ${btn.border}`,
                borderRadius: '12px', color: btn.color, fontSize: '11px', fontWeight: '800',
                cursor: 'pointer', fontFamily: "'Orbitron', monospace", letterSpacing: '2px',
              }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
