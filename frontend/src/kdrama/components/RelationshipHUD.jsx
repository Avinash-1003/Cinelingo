// ─────────────────────────────────────────────────────────────────────────────
// RELATIONSHIP HUD — NPC friendship/trust display overlay
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { NPCS, getNPCArc } from '../data/npcs';
import { useTheme } from '../../context/ThemeContext';

export default function RelationshipHUD() {
  const [expanded, setExpanded] = useState(false);
  const npcs = useGameStore(s => s.npcs);
  const currentScene = useGameStore(s => s.currentScene);
  const { isDark } = useTheme();

  const npcEntries = Object.entries(NPCS).filter(([id, npc]) => npcs[id]?.met);

  if (npcEntries.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      right: '16px',
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'auto',
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          alignSelf: 'flex-end',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.1)',
          borderRadius: '12px',
          cursor: 'pointer',
          color: isDark ? '#ffffff' : '#333',
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px',
          fontWeight: 500,
          transition: 'all 0.3s ease',
        }}
      >
        <span>💛</span>
        <span>{expanded ? 'Hide' : 'Relationships'}</span>
        <span style={{
          fontSize: '10px',
          opacity: 0.5,
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.3s ease',
        }}>▼</span>
      </button>

      {/* NPC cards */}
      {expanded && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          animation: 'fadeScale 0.3s ease',
        }}>
          {npcEntries.map(([id, npc]) => {
            const state = npcs[id];
            const arc = getNPCArc(id, state.friendship);
            const isHere = npc.location === currentScene;

            return (
              <div
                key={id}
                style={{
                  padding: '12px 16px',
                  background: isHere
                    ? `linear-gradient(135deg, ${npc.color}12, ${isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'})`
                    : (isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)'),
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '14px',
                  border: `1px solid ${isHere ? npc.color + '25' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')}`,
                  minWidth: '220px',
                  boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Name row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '18px' }}>{npc.avatar}</span>
                  <div>
                    <div style={{
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      color: npc.color,
                    }}>
                      {npc.name}
                    </div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '10px',
                      color: isDark ? 'rgba(255,255,255,0.35)' : '#666',
                    }}>
                      {npc.nameRomanized} · {npc.roleKorean}
                    </div>
                  </div>
                  {isHere && (
                    <span style={{
                      marginLeft: 'auto',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: 'rgba(0,255,100,0.1)',
                      border: '1px solid rgba(0,255,100,0.2)',
                      fontSize: '9px',
                      color: '#44ff88',
                      fontWeight: 600,
                    }}>
                      HERE
                    </span>
                  )}
                </div>

                {/* Arc title */}
                {arc && (
                  <div style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: '11px',
                    color: isDark ? 'rgba(255,255,255,0.5)' : '#555',
                    marginBottom: '8px',
                  }}>
                    {arc.title} · <span style={{ fontStyle: 'italic', fontFamily: "'Inter', sans-serif" }}>{arc.titlePhonetic}</span>
                  </div>
                )}

                {/* Friendship bar */}
                <div style={{ marginBottom: '5px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '3px',
                  }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '10px',
                      color: isDark ? 'rgba(255,255,255,0.3)' : '#888',
                    }}>
                      Friendship
                    </span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '10px',
                      color: npc.color,
                      fontWeight: 600,
                    }}>
                      {state.friendship}
                    </span>
                  </div>
                  <div style={{
                    height: '3px',
                    borderRadius: '2px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${state.friendship}%`,
                      borderRadius: '2px',
                      background: `linear-gradient(90deg, ${npc.color}88, ${npc.color})`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>

                {/* Trust bar */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '3px',
                  }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '10px',
                      color: isDark ? 'rgba(255,255,255,0.3)' : '#888',
                    }}>
                      Trust
                    </span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '10px',
                      color: '#00e5ff',
                      fontWeight: 600,
                    }}>
                      {state.trust}
                    </span>
                  </div>
                  <div style={{
                    height: '3px',
                    borderRadius: '2px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${state.trust}%`,
                      borderRadius: '2px',
                      background: 'linear-gradient(90deg, rgba(0,229,255,0.5), #00e5ff)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
