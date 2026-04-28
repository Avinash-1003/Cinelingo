// ─────────────────────────────────────────────────────────────────────────────
// CINELINGO: K-DRAMA SIMULATOR — Main Game Page
// Orchestrates all systems: scenes, dialogue, relationships, episodes
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import SceneRenderer from './components/SceneRenderer';
import DialoguePanel from './components/DialoguePanel';
import RelationshipHUD from './components/RelationshipHUD';
import EpisodeTracker from './components/EpisodeTracker';
import LocationTransition, { LocationMap } from './components/LocationTransition';
import { EPISODES } from './data/episodes';
import { ACHIEVEMENTS } from './data/episodes';
import { WordCard } from './components/LanguageDisplay';
import { useTheme } from '../context/ThemeContext';

// Inject global styles & fonts
const KDRAMA_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');

  @keyframes fadeScale { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes slideDown { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes pulseGlow { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes neonFlicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.6} 94%{opacity:1} 97%{opacity:0.8} 98%{opacity:1} }
`;

// ── MAIN MENU ──────────────────────────────────────────────────────────────
function MainMenu({ onPlay, onContinue, hasSave }) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = useState(null);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? 'linear-gradient(180deg, #050510 0%, #0a0f1e 40%, #0f0a18 70%, #050510 100%)' : 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 40%, #f4f4f9 70%, #f0f4f8 100%)',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Animated background particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: ['#ff8fab', '#7c8cf8', '#a78bfa', '#f0a050', '#00e5ff'][i % 5],
            opacity: 0.15 + Math.random() * 0.25,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
          }} />
        ))}
      </div>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,105,141,0.06) 0%, transparent 70%)',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        animation: 'breathe 8s ease-in-out infinite',
      }} />

      {/* Logo */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
        animation: 'fadeScale 0.8s ease',
      }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
          textTransform: 'uppercase',
          letterSpacing: '6px',
          marginBottom: '16px',
        }}>
          CineLingo Presents
        </div>

        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '52px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #ff8fab, #e8698d, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.1,
          marginBottom: '8px',
          animation: 'neonFlicker 5s linear infinite',
        }}>
          K-Drama
        </div>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '20px',
          fontWeight: 700,
          color: '#00e5ff',
          letterSpacing: '8px',
          textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(0,229,255,0.3)',
        }}>
          Simulator
        </div>

        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: isDark ? 'rgba(255,255,255,0.35)' : '#666',
          marginTop: '20px',
          fontStyle: 'italic',
          maxWidth: '380px',
        }}>
          Explore Seoul. Learn Korean. Build relationships. Live the drama.
        </div>

        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '13px',
          color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
          marginTop: '8px',
        }}>
          서울을 탐험하다 · Seourul tamheomhada
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '280px',
        animation: 'slideUp 0.6s ease 0.3s both',
      }}>
        {hasSave && (
          <button
            onClick={onContinue}
            onMouseEnter={() => setHoveredBtn('continue')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '16px 24px',
              background: hoveredBtn === 'continue'
                ? 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(0,229,255,0.1))'
                : 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,229,255,0.05))',
              border: '1px solid rgba(0,229,255,0.25)',
              borderRadius: '14px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              fontWeight: 600,
              color: '#00e5ff',
              transition: 'all 0.3s ease',
              transform: hoveredBtn === 'continue' ? 'translateY(-2px)' : 'none',
              boxShadow: hoveredBtn === 'continue' ? '0 8px 32px rgba(0,229,255,0.15)' : 'none',
            }}
          >
            이어하기 — Continue
          </button>
        )}

        <button
          onClick={onPlay}
          onMouseEnter={() => setHoveredBtn('play')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            padding: '16px 24px',
            background: hoveredBtn === 'play'
              ? 'linear-gradient(135deg, rgba(232,105,141,0.25), rgba(232,105,141,0.1))'
              : 'linear-gradient(135deg, rgba(232,105,141,0.12), rgba(232,105,141,0.05))',
            border: '1px solid rgba(232,105,141,0.25)',
            borderRadius: '14px',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: '15px',
            fontWeight: 600,
            color: '#e8698d',
            transition: 'all 0.3s ease',
            transform: hoveredBtn === 'play' ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredBtn === 'play' ? '0 8px 32px rgba(232,105,141,0.15)' : 'none',
          }}
        >
          {hasSave ? '새로 시작 — New Game' : '시작하기 — Start Game'}
        </button>

        <button
          onClick={() => navigate('/')}
          onMouseEnter={() => setHoveredBtn('back')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '14px',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: isDark ? 'rgba(255,255,255,0.35)' : '#666',
            transition: 'all 0.3s ease',
            transform: hoveredBtn === 'back' ? 'translateY(-1px)' : 'none',
          }}
        >
          ← Back to Home
        </button>
      </div>

      {/* Version */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        fontFamily: "'Inter', sans-serif",
        fontSize: '10px',
        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',
      }}>
        CineLingo K-Drama Simulator v1.0 · 시네링고
      </div>
    </div>
  );
}

// ── GAME HUD ──────────────────────────────────────────────────────────────
function GameHUD() {
  const { isDark } = useTheme();
  const currentScene = useGameStore(s => s.currentScene);
  const currentEpisode = useGameStore(s => s.currentEpisode);
  const learnedWords = useGameStore(s => s.learnedWords);
  const setGamePhase = useGameStore(s => s.setGamePhase);
  const toggleLocationMap = useGameStore(s => s.toggleLocationMap);
  const isInDialogue = useGameStore(s => s.isInDialogue);
  const [showVocab, setShowVocab] = useState(false);

  const sceneMeta = {
    cafe: { name: '카페', icon: '☕', color: '#f0a050' },
    street: { name: '거리', icon: '🌃', color: '#7c8cf8' },
    subway: { name: '지하철', icon: '🚇', color: '#a78bfa' },
  };
  const scene = sceneMeta[currentScene] || sceneMeta.cafe;

  return (
    <>
      {/* Top HUD bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: '12px 16px',
        background: isDark ? 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)' : 'linear-gradient(180deg, rgba(255,255,255,0.85), transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        {/* Left — location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'auto',
        }}>
          <button
            onClick={() => setGamePhase('menu')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              cursor: 'pointer',
              color: isDark ? '#ffffff' : '#333',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            ☰
          </button>

          <div style={{
            padding: '6px 14px',
            borderRadius: '10px',
            background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${scene.color}20`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>{scene.icon}</span>
            <span style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              color: scene.color,
            }}>
              {scene.name}
            </span>
          </div>
        </div>

        {/* Center — episode */}
        <div style={{
          padding: '4px 12px',
          borderRadius: '8px',
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          color: isDark ? 'rgba(255,255,255,0.35)' : '#666',
        }}>
          EP {currentEpisode}
        </div>

        {/* Right — actions */}
        <div style={{
          display: 'flex',
          gap: '6px',
          pointerEvents: 'auto',
        }}>
          <button
            onClick={() => setShowVocab(!showVocab)}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              color: isDark ? 'rgba(255,255,255,0.5)' : '#555',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease',
            }}
          >
            📖 <span style={{ color: '#00e5ff', fontWeight: 700 }}>{learnedWords.length}</span>
          </button>

          {!isInDialogue && (
            <button
              onClick={toggleLocationMap}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                color: isDark ? 'rgba(255,255,255,0.5)' : '#555',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
              }}
            >
              🗺️ Map
            </button>
          )}
        </div>
      </div>

      {/* Vocabulary panel */}
      {showVocab && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '16px',
          bottom: '100px',
          width: '260px',
          zIndex: 45,
          background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
          overflow: 'auto',
          padding: '16px',
          animation: 'fadeScale 0.3s ease',
          pointerEvents: 'auto',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}>
            <div style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#333',
            }}>
              단어장
            </div>
            <button
              onClick={() => setShowVocab(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isDark ? 'rgba(255,255,255,0.3)' : '#888',
                fontSize: '14px',
              }}
            >
              ✕
            </button>
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            color: isDark ? 'rgba(255,255,255,0.3)' : '#888',
            fontStyle: 'italic',
            marginBottom: '12px',
          }}>
            Vocabulary — {learnedWords.length} words learned
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            {learnedWords.length === 0 ? (
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                textAlign: 'center',
                padding: '20px',
              }}>
                Start interacting to learn words!
              </div>
            ) : (
              learnedWords.map(wid => (
                <WordCard key={wid} wordId={wid} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Movement hint (when not in dialogue) */}
      {!isInDialogue && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 35,
          display: 'flex',
          gap: '4px',
          pointerEvents: 'none',
        }}>
          {['W', 'A', 'S', 'D'].map(key => (
            <div key={key} style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Inter', sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.25)',
            }}>
              {key}
            </div>
          ))}
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px',
            color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.4)',
            alignSelf: 'center',
            marginLeft: '6px',
          }}>
            Move · Click NPCs to talk
          </span>
        </div>
      )}
    </>
  );
}

// ── EPISODE COMPLETE OVERLAY ───────────────────────────────────────────────
function EpisodeCompleteOverlay() {
  const { isDark } = useTheme();
  const showEpisodeComplete = useGameStore(s => s.showEpisodeComplete);
  const dismissEpisodeComplete = useGameStore(s => s.dismissEpisodeComplete);
  const setGamePhase = useGameStore(s => s.setGamePhase);
  const currentEpisode = useGameStore(s => s.currentEpisode);
  const learnedWords = useGameStore(s => s.learnedWords);

  if (!showEpisodeComplete) return null;

  const episode = EPISODES.find(e => e.id === currentEpisode);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      animation: 'fadeScale 0.5s ease',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          {episode?.icon || '✨'}
        </div>

        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          marginBottom: '12px',
        }}>
          Episode {currentEpisode} Complete
        </div>

        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '32px',
          fontWeight: 800,
          color: isDark ? (episode?.coverColor || '#ffffff') : (episode?.coverColor || '#222'),
          marginBottom: '6px',
        }}>
          {episode?.title || 'Complete'}
        </div>

        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: isDark ? 'rgba(255,255,255,0.4)' : '#666',
          fontStyle: 'italic',
          marginBottom: '28px',
        }}>
          {episode?.titlePhonetic} — {episode?.titleEn}
        </div>

        {episode?.isFinale ? (
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            color: isDark ? 'rgba(255,255,255,0.6)' : '#444',
            marginBottom: '24px',
            lineHeight: 1.6,
          }}>
            🌸 You've completed the story! 🌸<br />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
              Words learned: {learnedWords.length} · Relationships built: ∞
            </span>
          </div>
        ) : (
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: isDark ? 'rgba(255,255,255,0.35)' : '#666',
            marginBottom: '24px',
          }}>
            Words learned so far: {learnedWords.length}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => {
              dismissEpisodeComplete();
              setGamePhase('episode_select');
            }}
            style={{
              padding: '12px 28px',
              background: `linear-gradient(135deg, ${episode?.coverColor || '#e8698d'}20, ${episode?.coverColor || '#e8698d'}10)`,
              border: `1px solid ${episode?.coverColor || '#e8698d'}30`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: episode?.coverColor || '#e8698d',
              transition: 'all 0.3s ease',
            }}
          >
            {episode?.isFinale ? '다시 보기 — Replay' : '다음 — Next Episode'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ACHIEVEMENT NOTIFICATION ──────────────────────────────────────────────
function AchievementNotification() {
  const { isDark } = useTheme();
  const showAchievement = useGameStore(s => s.showAchievement);

  if (!showAchievement) return null;

  const achievement = ACHIEVEMENTS.find(a => a.id === showAchievement);
  if (!achievement) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 95,
      padding: '14px 24px',
      background: isDark ? 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(0,0,0,0.85))' : 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,255,255,0.9))',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '16px',
      border: '1px solid rgba(255,215,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      animation: 'slideDown 0.4s ease, fadeScale 0.4s ease',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 40px rgba(255,215,0,0.05)',
    }}>
      <span style={{ fontSize: '28px' }}>{achievement.icon}</span>
      <div>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '9px',
          fontWeight: 600,
          color: '#ffd700',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '4px',
        }}>
          Achievement Unlocked
        </div>
        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '15px',
          fontWeight: 700,
          color: isDark ? '#ffffff' : '#333',
        }}>
          {achievement.title}
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
        }}>
          {achievement.phonetic} — {achievement.description}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function KDramaGame() {
  const { isDark } = useTheme();
  const gamePhase = useGameStore(s => s.gamePhase);
  const initGame = useGameStore(s => s.initGame);
  const setGamePhase = useGameStore(s => s.setGamePhase);
  const startEpisode = useGameStore(s => s.startEpisode);
  const enterFreeRoam = useGameStore(s => s.enterFreeRoam);
  const resetGame = useGameStore(s => s.resetGame);
  const isLoaded = useGameStore(s => s.isLoaded);
  const completedEpisodes = useGameStore(s => s.completedEpisodes);

  useEffect(() => {
    initGame();
  }, [initGame]);

  if (!isLoaded) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: isDark ? '#050510' : '#f4f4f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(232,105,141,0.15)',
          borderTop: '3px solid #e8698d',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          color: isDark ? 'rgba(255,255,255,0.3)' : '#888',
          fontSize: '13px',
        }}>
          Loading K-Drama Simulator...
        </span>
      </div>
    );
  }

  const hasSave = completedEpisodes.length > 0;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: isDark ? '#050510' : '#f4f4f9',
      fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
    }}>
      <style>{KDRAMA_STYLES}</style>

      {/* Main Menu */}
      {gamePhase === 'menu' && (
        <MainMenu
          hasSave={hasSave}
          onPlay={() => {
            resetGame();
            setGamePhase('episode_select');
          }}
          onContinue={() => setGamePhase('episode_select')}
        />
      )}

      {/* Episode Select */}
      {gamePhase === 'episode_select' && (
        <EpisodeTracker
          onSelectEpisode={(epId) => startEpisode(epId)}
          onFreeRoam={() => enterFreeRoam()}
        />
      )}

      {/* Playing / Dialogue — 3D Scene + UI overlays */}
      {(gamePhase === 'playing' || gamePhase === 'dialogue') && (
        <>
          {/* 3D Scene */}
          <SceneRenderer />

          {/* HUD */}
          <GameHUD />

          {/* Relationship HUD */}
          <RelationshipHUD />

          {/* Dialogue Panel */}
          <DialoguePanel />

          {/* Location Map */}
          <LocationMap />

          {/* Location Transition */}
          <LocationTransition />

          {/* Episode Complete */}
          <EpisodeCompleteOverlay />

          {/* Achievements */}
          <AchievementNotification />
        </>
      )}
    </div>
  );
}
