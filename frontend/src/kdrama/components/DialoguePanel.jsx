// ─────────────────────────────────────────────────────────────────────────────
// DIALOGUE PANEL — Branching dialogue UI overlay
// Typewriter effect, speaker portraits, choice buttons
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { NPCS } from '../data/npcs';
import LanguageDisplay from './LanguageDisplay';
import { useTheme } from '../../context/ThemeContext';

const TYPEWRITER_SPEEDS = { slow: 60, normal: 35, fast: 15 };

export default function DialoguePanel() {
  const { isDark } = useTheme();
  const isInDialogue = useGameStore(s => s.isInDialogue);
  const currentNode = useGameStore(s => s.currentDialogueNode);
  const selectChoice = useGameStore(s => s.selectChoice);
  const advanceDialogue = useGameStore(s => s.advanceDialogue);
  const handleNarrationNext = useGameStore(s => s.handleNarrationNext);
  const textSpeed = useGameStore(s => s.textSpeed);

  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [hoveredChoice, setHoveredChoice] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  const speed = TYPEWRITER_SPEEDS[textSpeed] || TYPEWRITER_SPEEDS.normal;

  // Typewriter effect
  useEffect(() => {
    if (!currentNode) return;

    setFadeIn(true);
    setShowChoices(false);

    const fullText = currentNode.type === 'narration'
      ? (currentNode.narration || '')
      : (currentNode.korean || '');

    if (!fullText) {
      setDisplayText('');
      setIsTyping(false);
      if (currentNode.choices) setShowChoices(true);
      return;
    }

    setDisplayText('');
    setIsTyping(true);
    let index = 0;

    const timer = setInterval(() => {
      index++;
      setDisplayText(fullText.substring(0, index));
      if (index >= fullText.length) {
        clearInterval(timer);
        setIsTyping(false);
        setTimeout(() => {
          if (currentNode.choices) setShowChoices(true);
        }, 200);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [currentNode, speed]);

  const handleSkip = useCallback(() => {
    if (isTyping) {
      // Skip to full text
      const fullText = currentNode?.type === 'narration'
        ? (currentNode?.narration || '')
        : (currentNode?.korean || '');
      setDisplayText(fullText);
      setIsTyping(false);
      if (currentNode?.choices) {
        setTimeout(() => setShowChoices(true), 100);
      }
    } else if (!currentNode?.choices) {
      // Advance narration
      if (currentNode?.type === 'narration') {
        handleNarrationNext();
      } else if (currentNode?.next) {
        advanceDialogue(currentNode.next);
      } else {
        advanceDialogue(null);
      }
    }
  }, [isTyping, currentNode, advanceDialogue, handleNarrationNext]);

  if (!isInDialogue || !currentNode) return null;

  const speaker = currentNode.speaker ? NPCS[currentNode.speaker] : null;
  const isNarration = currentNode.type === 'narration';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '0 24px 24px',
        pointerEvents: 'auto',
        animation: fadeIn ? 'slideUp 0.4s ease' : 'none',
      }}
    >
      {/* Dialogue Container */}
      <div
        onClick={handleSkip}
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: isNarration
            ? (isDark ? 'linear-gradient(180deg, rgba(10,10,30,0.85), rgba(10,10,30,0.95))' : 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.95))')
            : (isDark ? 'linear-gradient(180deg, rgba(10,10,30,0.8), rgba(10,10,30,0.95))' : 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.95))'),
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
          borderRadius: '20px',
          border: `1px solid ${speaker ? `${speaker.color}22` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
          padding: '24px 28px',
          cursor: !currentNode.choices || isTyping ? 'pointer' : 'default',
          boxShadow: `0 -8px 40px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)'}, ${speaker ? `0 0 60px ${speaker.color}08` : ''}`,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Speaker header */}
        {speaker && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            {/* Speaker avatar */}
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${speaker.color}30, ${speaker.color}10)`,
              border: `1.5px solid ${speaker.color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: `0 0 20px ${speaker.color}15`,
            }}>
              {speaker.avatar}
            </div>

            {/* Name */}
            <div>
              <div style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                color: speaker.color,
                letterSpacing: '0.5px',
              }}>
                {speaker.name}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                color: isDark ? 'rgba(255,255,255,0.35)' : '#666',
                fontWeight: 500,
              }}>
                {speaker.nameRomanized} · {speaker.roleKorean}
              </div>
            </div>

            {/* Emotion badge */}
            {currentNode.emotion && (
              <div style={{
                marginLeft: 'auto',
                padding: '4px 10px',
                borderRadius: '8px',
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                color: isDark ? 'rgba(255,255,255,0.4)' : '#666',
                fontStyle: 'italic',
              }}>
                {currentNode.emotion}
              </div>
            )}
          </div>
        )}

        {/* Narration label */}
        {isNarration && (
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px',
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.25)' : '#888',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '12px',
          }}>
            ✦ Narration
          </div>
        )}

        {/* Main text */}
        {isNarration ? (
          <div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '17px',
              fontWeight: 400,
              color: isDark ? 'rgba(255,255,255,0.85)' : '#333',
              lineHeight: 1.7,
              letterSpacing: '0.2px',
            }}>
              {displayText}
              {isTyping && (
                <span style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '17px',
                  background: '#00e5ff',
                  marginLeft: '2px',
                  verticalAlign: 'text-bottom',
                  animation: 'pulseGlow 0.8s infinite',
                }} />
              )}
            </div>
            {currentNode.narrationKorean && !isTyping && (
              <div style={{
                marginTop: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(0,229,255,0.04)',
                border: '1px solid rgba(0,229,255,0.1)',
              }}>
                <LanguageDisplay
                  korean={currentNode.narrationKorean}
                  phonetic={currentNode.narrationPhonetic}
                  size="small"
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Korean dialogue */}
            <LanguageDisplay
              korean={displayText}
              phonetic={!isTyping ? currentNode.phonetic : '...'}
              highlightWords={!isTyping ? currentNode.highlightWords : []}
              learnWordIds={currentNode.learnWords}
            />
          </div>
        )}

        {/* Click to continue indicator */}
        {!isTyping && !currentNode.choices && (
          <div style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            color: isDark ? 'rgba(255,255,255,0.25)' : '#888',
            animation: 'pulseGlow 2s infinite',
          }}>
            <span style={{ fontSize: '8px' }}>▶</span>
            Click to continue
          </div>
        )}

        {/* Choices */}
        {showChoices && currentNode.choices && (
          <div style={{
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeScale 0.3s ease',
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.2)' : '#888',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '4px',
            }}>
              Choose your response
            </div>

            {currentNode.choices.map((choice, i) => (
              <button
                key={choice.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectChoice(choice);
                }}
                onMouseEnter={() => setHoveredChoice(choice.id)}
                onMouseLeave={() => setHoveredChoice(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '14px 18px',
                  background: hoveredChoice === choice.id
                    ? `linear-gradient(135deg, ${speaker?.color || '#00e5ff'}15, ${speaker?.color || '#00e5ff'}08)`
                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                  border: `1px solid ${hoveredChoice === choice.id ? (speaker?.color || '#00e5ff') + '40' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  transform: hoveredChoice === choice.id ? 'translateX(4px)' : 'none',
                  color: '#ffffff',
                }}
              >
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  color: hoveredChoice === choice.id ? (isDark ? '#ffffff' : '#000') : (isDark ? 'rgba(255,255,255,0.75)' : '#444'),
                }}>
                  {choice.text}
                </span>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}>
                  <span style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: '15px',
                    fontWeight: 500,
                    color: hoveredChoice === choice.id ? (speaker?.color || '#00e5ff') : (isDark ? 'rgba(255,255,255,0.5)' : '#666'),
                  }}>
                    {choice.korean}
                  </span>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    fontStyle: 'italic',
                    color: isDark ? 'rgba(255,255,255,0.3)' : '#888',
                  }}>
                    {choice.phonetic}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
