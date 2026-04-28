// ─────────────────────────────────────────────────────────────────────────────
// EPISODE TRACKER — Story progression UI
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { EPISODES, isEpisodeUnlocked } from '../data/episodes';
import { useTheme } from '../../context/ThemeContext';

export default function EpisodeTracker({ onSelectEpisode, onFreeRoam }) {
  const { isDark } = useTheme();
  const completedEpisodes = useGameStore(s => s.completedEpisodes);
  const npcs = useGameStore(s => s.npcs);
  const learnedWords = useGameStore(s => s.learnedWords);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: isDark ? 'linear-gradient(180deg, rgba(5,5,16,0.97), rgba(5,5,16,0.99))' : 'linear-gradient(180deg, rgba(255,255,255,0.93), rgba(255,255,255,0.97))',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'auto',
      padding: '40px 24px',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '12px',
      }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '12px',
          fontWeight: 600,
          color: isDark ? 'rgba(255,255,255,0.25)' : '#888',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          marginBottom: '12px',
        }}>
          K-Drama Simulator
        </div>
        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '32px',
          fontWeight: 800,
          color: isDark ? '#ffffff' : '#111',
          marginBottom: '4px',
        }}>
          에피소드 선택
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: isDark ? 'rgba(255,255,255,0.4)' : '#666',
          fontStyle: 'italic',
        }}>
          Episodeu seontaek — Choose your episode
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '32px',
        padding: '12px 24px',
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        borderRadius: '14px',
        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)',
      }}>
        {[
          { label: 'Episodes', value: `${completedEpisodes.length}/5`, icon: '📺' },
          { label: 'Words', value: learnedWords.length, icon: '📖' },
        ].map((stat, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>{stat.icon}</span>
            <div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                color: isDark ? '#ffffff' : '#111',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                color: isDark ? 'rgba(255,255,255,0.3)' : '#888',
              }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Episode cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '600px',
        width: '100%',
      }}>
        {EPISODES.map((ep, i) => {
          const unlocked = isEpisodeUnlocked(ep, completedEpisodes, npcs);
          const completed = completedEpisodes.includes(ep.id);

          return (
            <button
              key={ep.id}
              onClick={() => unlocked && onSelectEpisode(ep.id)}
              disabled={!unlocked}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '20px 24px',
                background: completed
                  ? `linear-gradient(135deg, ${ep.coverColor}10, ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'})`
                  : unlocked
                    ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)')
                    : (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'),
                borderRadius: '18px',
                border: `1px solid ${completed ? ep.coverColor + '30' : unlocked ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)')}`,
                cursor: unlocked ? 'pointer' : 'not-allowed',
                textAlign: 'left',
                color: isDark ? '#ffffff' : '#111',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                opacity: unlocked ? 1 : 0.4,
                position: 'relative',
                overflow: 'hidden',
                animation: `fadeScale 0.4s ease ${i * 0.08}s both`,
              }}
              onMouseEnter={(e) => {
                if (unlocked) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3)${completed ? `, 0 0 40px ${ep.coverColor}10` : ''}`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Episode number */}
              <div style={{
                minWidth: '50px',
                height: '50px',
                borderRadius: '14px',
                background: completed
                  ? ep.coverGradient
                  : 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
                border: completed ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)'),
              }}>
                {completed ? '✅' : unlocked ? ep.icon : '🔒'}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    fontWeight: 600,
                    color: isDark ? 'rgba(255,255,255,0.25)' : '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                  }}>
                    Episode {ep.id}
                  </span>
                  {ep.isFinale && unlocked && (
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: 'rgba(232,105,141,0.15)',
                      border: '1px solid rgba(232,105,141,0.3)',
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#e8698d',
                      textTransform: 'uppercase',
                    }}>
                      Finale
                    </span>
                  )}
                </div>

                <div style={{
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: completed ? ep.coverColor : (isDark ? '#ffffff' : '#111'),
                  marginBottom: '2px',
                }}>
                  {ep.title}
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: isDark ? 'rgba(255,255,255,0.35)' : '#777',
                  fontStyle: 'italic',
                  marginBottom: '6px',
                }}>
                  {ep.titlePhonetic} — {ep.titleEn}
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  color: isDark ? 'rgba(255,255,255,0.5)' : '#555',
                  lineHeight: 1.5,
                }}>
                  {ep.subtitle}
                </div>

                {/* Duration + locations */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '8px',
                }}>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    color: isDark ? 'rgba(255,255,255,0.2)' : '#888',
                  }}>
                    ⏱ {ep.duration}
                  </span>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    color: isDark ? 'rgba(255,255,255,0.2)' : '#888',
                  }}>
                    📍 {ep.locations.join(', ')}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Free Roam button */}
      <button
        onClick={onFreeRoam}
        style={{
          marginTop: '24px',
          padding: '14px 32px',
          background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,229,255,0.05))',
          border: '1px solid rgba(0,229,255,0.2)',
          borderRadius: '14px',
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: '#00e5ff',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,229,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        🗺️ Free Roam — 자유 탐험
      </button>
    </div>
  );
}
