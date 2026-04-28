// ─────────────────────────────────────────────────────────────────────────────
// LOCATION TRANSITION — Cinematic scene transition overlay
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../../context/ThemeContext';

const LOCATION_META = {
  cafe: {
    name: '카페',
    namePhonetic: 'Kape',
    nameEn: 'Korean Café',
    icon: '☕',
    color: '#f0a050',
    description: 'A warm refuge in the heart of Seoul',
  },
  street: {
    name: '거리',
    namePhonetic: 'Geori',
    nameEn: 'City Street',
    icon: '🌃',
    color: '#7c8cf8',
    description: 'Neon-lit streets of Hongdae',
  },
  subway: {
    name: '지하철',
    namePhonetic: 'Jihacheol',
    nameEn: 'Subway Interior',
    icon: '🚇',
    color: '#a78bfa',
    description: 'Seoul Metro Line 2',
  },
};

export default function LocationTransition() {
  const isTransitioning = useGameStore(s => s.isTransitioning);
  const currentScene = useGameStore(s => s.currentScene);
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setVisible(true);
      setShowLocation(false);
    }
  }, [isTransitioning]);

  useEffect(() => {
    if (!isTransitioning && visible) {
      setShowLocation(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setShowLocation(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, visible]);

  if (!visible && !showLocation) return null;

  const loc = LOCATION_META[currentScene] || LOCATION_META.cafe;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isTransitioning
        ? (isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)')
        : 'rgba(0,0,0,0)',
      transition: 'background 0.6s ease',
      pointerEvents: isTransitioning ? 'auto' : 'none',
    }}>
      {showLocation && (
        <div style={{
          textAlign: 'center',
          animation: 'fadeScale 0.5s ease, fadeOut 0.5s ease 1s forwards',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {loc.icon}
          </div>
          <div style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: '36px',
            fontWeight: 800,
            color: loc.color,
            textShadow: `0 0 30px ${loc.color}40`,
            marginBottom: '6px',
          }}>
            {loc.name}
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            color: isDark ? 'rgba(255,255,255,0.4)' : '#666',
            fontStyle: 'italic',
          }}>
            {loc.namePhonetic} — {loc.nameEn}
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            color: isDark ? 'rgba(255,255,255,0.25)' : '#888',
            marginTop: '8px',
          }}>
            {loc.description}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Location map overlay for free roam
export function LocationMap() {
  const showLocationMap = useGameStore(s => s.showLocationMap);
  const toggleLocationMap = useGameStore(s => s.toggleLocationMap);
  const changeScene = useGameStore(s => s.changeScene);
  const currentScene = useGameStore(s => s.currentScene);
  const visitedLocations = useGameStore(s => s.visitedLocations);
  const { isDark } = useTheme();

  if (!showLocationMap) return null;

  const locations = ['cafe', 'street', 'subway'];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 70,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '32px',
        animation: 'fadeScale 0.3s ease',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <div style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: '22px',
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#111',
            }}>
              이동 — 장소 선택
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              color: isDark ? 'rgba(255,255,255,0.35)' : '#777',
              fontStyle: 'italic',
            }}>
              Idong — Jangso seontaek
            </div>
          </div>
          <button
            onClick={toggleLocationMap}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              cursor: 'pointer',
              color: isDark ? '#ffffff' : '#111',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {locations.map(loc => {
            const meta = LOCATION_META[loc];
            const isHere = loc === currentScene;
            const visited = visitedLocations.includes(loc);

            return (
              <button
                key={loc}
                onClick={() => {
                  if (!isHere) {
                    changeScene(loc);
                    toggleLocationMap();
                  }
                }}
                disabled={isHere}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '18px 22px',
                  background: isHere
                    ? `linear-gradient(135deg, ${meta.color}15, ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)'})`
                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                  borderRadius: '16px',
                  border: `1px solid ${isHere ? meta.color + '30' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`,
                  cursor: isHere ? 'default' : 'pointer',
                  color: isDark ? '#ffffff' : '#111',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isHere) e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <span style={{
                  fontSize: '28px',
                  width: '46px',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  background: isHere ? `${meta.color}15` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                  border: `1px solid ${isHere ? meta.color + '25' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)')}`,
                }}>
                  {meta.icon}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: '17px',
                    fontWeight: 600,
                    color: isHere ? meta.color : (isDark ? '#ffffff' : '#111'),
                  }}>
                    {meta.name}
                  </div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    color: isDark ? 'rgba(255,255,255,0.35)' : '#777',
                  }}>
                    {meta.namePhonetic} — {meta.nameEn}
                  </div>
                </div>

                {isHere && (
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: `${meta.color}15`,
                    border: `1px solid ${meta.color}30`,
                    fontSize: '11px',
                    fontWeight: 600,
                    color: meta.color,
                  }}>
                    현재 위치
                  </span>
                )}
                {!isHere && visited && (
                  <span style={{
                    fontSize: '11px',
                    color: isDark ? 'rgba(255,255,255,0.2)' : '#888',
                  }}>
                    방문함
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
