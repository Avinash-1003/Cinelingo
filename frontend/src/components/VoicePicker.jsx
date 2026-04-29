import React, { useState, useEffect, useCallback } from 'react';
import { getKoreanVoices, getPreferredVoiceName, setPreferredVoiceName, speakKorean } from '../utils/voice';

/**
 * Compact voice selector dropdown for Korean TTS.
 * Shows available Korean voices and lets the user pick + preview one.
 */
export default function VoicePicker({ accentColor = '#e94560', isDark = true }) {
  const [voices, setVoices] = useState([]);
  const [selected, setSelected] = useState(getPreferredVoiceName() || '');
  const [open, setOpen] = useState(false);

  const loadVoices = useCallback(() => {
    const ko = getKoreanVoices();
    setVoices(ko);
    // Auto-select if none stored
    if (!selected && ko.length) {
      setSelected(ko[0].name);
    }
  }, [selected]);

  useEffect(() => {
    loadVoices();
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [loadVoices]);

  const handleSelect = (name) => {
    setSelected(name);
    setPreferredVoiceName(name);
    setOpen(false);
    // Preview the voice
    setTimeout(() => speakKorean('안녕하세요'), 100);
  };

  if (voices.length <= 1) return null; // No point showing if only 1 voice

  const currentVoice = voices.find(v => v.name === selected) || voices[0];
  const shortName = currentVoice
    ? currentVoice.name.replace(/^(Google|Microsoft|Apple)\s*/i, '').replace(/\s*\(.*?\)$/, '')
    : 'Default';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '10px',
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          color: isDark ? '#aaa' : '#555',
          fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all .2s',
        }}
        title="Change Korean voice"
      >
        🗣️ {shortName}
        <span style={{ fontSize: '9px', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: '100%', left: 0, marginTop: '6px',
            minWidth: '240px', maxHeight: '260px', overflowY: 'auto',
            background: isDark ? '#1a1a2e' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '12px', zIndex: 999,
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
            padding: '6px',
          }}
        >
          <div style={{
            fontSize: '10px', color: isDark ? '#555' : '#999', fontWeight: '700',
            letterSpacing: '1px', padding: '6px 10px', marginBottom: '2px',
          }}>
            KOREAN VOICES ({voices.length})
          </div>
          {voices.map(v => {
            const isActive = v.name === selected;
            const label = v.name.replace(/^(Google|Microsoft|Apple)\s*/i, '').replace(/\s*\(.*?\)$/, '');
            const provider = v.name.match(/^(Google|Microsoft|Apple)/i)?.[1] || '';
            return (
              <div
                key={v.name}
                onClick={() => handleSelect(v.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                  background: isActive ? `${accentColor}18` : 'transparent',
                  border: isActive ? `1px solid ${accentColor}44` : '1px solid transparent',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '16px' }}>{isActive ? '✅' : '🗣️'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: isActive ? '700' : '500',
                    color: isActive ? accentColor : (isDark ? '#ccc' : '#333'),
                  }}>
                    {label}
                  </div>
                  {provider && (
                    <div style={{ fontSize: '10px', color: isDark ? '#444' : '#aaa' }}>
                      {provider} · {v.localService ? 'Offline' : 'Online'}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Preview this specific voice
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance('안녕하세요');
                    u.lang = 'ko-KR'; u.voice = v; u.rate = 0.85; u.pitch = 1.1;
                    window.speechSynthesis.speak(u);
                  }}
                  style={{
                    padding: '3px 8px', borderRadius: '6px', border: 'none',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#888' : '#666', fontSize: '11px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  ▶ Test
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
