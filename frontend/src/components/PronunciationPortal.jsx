import React, { useState, useRef, useEffect, useCallback } from 'react';
import { speakKorean } from '../utils/voice';


// ── Scoring engine ─────────────────────────────────────────────────────────────
// 1. Exact Korean match      → 100
// 2. Romanization char match → partial score
// 3. Web Speech confidence   → bonus up to 15pts
// 4. Syllable-level diff     → per-syllable marks
function scoreAttempt(spokenRaw, targetKorean, targetRoman, confidence = 0.7) {
  const spoken    = spokenRaw.trim().toLowerCase();
  const korClean  = targetKorean.replace(/[\s.,!?]/g, '').toLowerCase();
  const romClean  = targetRoman.replace(/-/g, ' ').toLowerCase();

  // Exact Korean match
  if (spoken === korClean || spoken.replace(/\s/g,'') === korClean) return 100;

  // Romanization similarity (for non-Korean IME users)
  const romNoSpace = romClean.replace(/\s/g,'');
  const spokenNoSpace = spoken.replace(/\s/g,'');
  let charMatches = 0;
  const tChars = romNoSpace.split('');
  tChars.forEach(c => { if (spokenNoSpace.includes(c)) charMatches++; });
  const charRatio  = charMatches / Math.max(tChars.length, spokenNoSpace.length);

  // Korean character overlap (if user typed/said Korean)
  const korChars = korClean.split('');
  let korMatches = 0;
  korChars.forEach(c => { if (spoken.includes(c)) korMatches++; });
  const korRatio = korMatches / korChars.length;

  const bestRatio  = Math.max(charRatio, korRatio);
  const confBonus  = Math.round((confidence || 0.5) * 15);
  return Math.min(100, Math.max(10, Math.round(bestRatio * 85) + confBonus));
}

function markSyllables(spokenRaw, syllables, romanParts) {
  const spoken = spokenRaw.toLowerCase().replace(/\s/g,'');
  return romanParts.map((syl, i) => {
    const s = syl.toLowerCase();
    if (spoken.includes(s))           return 'correct';
    if (spoken.includes(s.slice(0,2))) return 'partial';
    if (spoken.includes(s[0]))         return 'partial';
    return 'wrong';
  });
}

// ── Color helpers ──────────────────────────────────────────────────────────────
const scoreColor = (s) =>
  s >= 80 ? '#1D9E75' : s >= 60 ? '#BA7517' : '#D85A30';

const syllableStyle = (mark, accent) => {
  const styles = {
    correct: { background:'#EAF3DE', color:'#3B6D11', borderColor:'#C0DD97' },
    partial: { background:'#FAEEDA', color:'#854F0B', borderColor:'#FAC775' },
    wrong:   { background:'#FCEBEB', color:'#A32D2D', borderColor:'#F7C1C1' },
    neutral: { background:'rgba(255,255,255,0.06)', color:'#888', borderColor:'rgba(255,255,255,0.15)' },
  };
  return styles[mark] || styles.neutral;
};

// ── SVG Score Ring ─────────────────────────────────────────────────────────────
function ScoreRing({ score, accent }) {
  const r = 38; const circ = 2 * Math.PI * r;
  const offset = score == null ? circ : circ - (score / 100) * circ;
  const color  = score == null ? 'rgba(255,255,255,0.1)' : scoreColor(score);
  return (
    <div style={{ position:'relative', display:'inline-flex',
      alignItems:'center', justifyContent:'center' }}>
      <svg width="90" height="90" viewBox="0 0 90 90"
        style={{ transform:'rotate(-90deg)' }}>
        <circle cx="45" cy="45" r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
        <circle cx="45" cy="45" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 0.6s ease, stroke 0.4s' }}/>
      </svg>
      <div style={{ position:'absolute', fontSize:'20px', fontWeight:'800',
        color: score == null ? '#444' : color,
        fontFamily:"'Syne',sans-serif", transition:'color 0.4s' }}>
        {score == null ? '—' : `${score}%`}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PronunciationPortal({ line, onClose, accentColor = '#e94560' }) {
  const [recording, setRecording]   = useState(false);
  const [score, setScore]           = useState(null);
  const [heard, setHeard]           = useState(null);
  const [marks, setMarks]           = useState(null);
  const [attempts, setAttempts]     = useState([]);
  const [waveHeights, setWaveHeights] = useState(Array(8).fill(6));
  const [tip, setTip]               = useState(null);
  const recRef  = useRef(null);
  const waveRef = useRef(null);

  // Build syllables from romanization
  const romanParts = (line.romanization || '').replace(/\./g,'').trim().split('-');
  const syllables  = romanParts;

  const startWave = useCallback(() => {
    let t = 0;
    waveRef.current = setInterval(() => {
      t++;
      setWaveHeights(
        Array.from({length:8}, (_,i) => Math.round(6 + Math.abs(Math.sin(t*0.35 + i*0.9)) * 20))
      );
    }, 80);
  }, []);

  const stopWave = useCallback(() => {
    clearInterval(waveRef.current);
    setWaveHeights(Array(8).fill(6));
  }, []);

  const processResult = useCallback((spokenText, confidence) => {
    const s = scoreAttempt(spokenText, line.korean, line.romanization, confidence);
    const m = markSyllables(spokenText, syllables, romanParts);
    setScore(s);
    setHeard(spokenText);
    setMarks(m);
    setTip(
      s >= 90 ? '🎉 완벽해요! Spot on!' :
      s >= 75 ? '👍 Great! Try a bit slower for clarity.' :
      s >= 55 ? '💪 Good effort — listen again and mimic the vowel sounds.' :
               '🔄 Try listening slowly first, then copy syllable by syllable.'
    );
    setAttempts(prev => [
      { korean: line.korean, spoken: spokenText, score: s },
      ...prev.slice(0, 9),
    ]);
  }, [line, syllables, romanParts]);

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Please use Chrome for voice recording.');
      return;
    }
    const r = new SR();
    r.lang = 'ko-KR'; r.continuous = false; r.interimResults = false;
    r.onresult = (e) => {
      processResult(
        e.results[0][0].transcript,
        e.results[0][0].confidence
      );
    };
    r.onend  = () => { setRecording(false); stopWave(); };
    r.onerror = () => { setRecording(false); stopWave(); };
    recRef.current = r;
    setRecording(true);
    startWave();
    r.start();
  }, [processResult, startWave, stopWave]);

  const stopRecording = useCallback(() => {
    recRef.current?.stop();
    setRecording(false);
    stopWave();
  }, [stopWave]);

  useEffect(() => () => {
    recRef.current?.abort();
    clearInterval(waveRef.current);
  }, []);

  const bestScore = attempts.length
    ? Math.max(...attempts.map(a => a.score))
    : null;

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.85)',
      zIndex:999, display:'flex', alignItems:'center', justifyContent:'center',
      padding:'16px', backdropFilter:'blur(6px)',
    }}>
      <div style={{
        background:'#0e0e24', border:`1px solid ${accentColor}33`,
        borderRadius:'20px', width:'100%', maxWidth:'620px',
        maxHeight:'90vh', overflowY:'auto',
        fontFamily:"'DM Sans', system-ui, sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.07)',
        }}>
          <div>
            <div style={{ fontSize:'11px', color:accentColor, fontWeight:'700',
              letterSpacing:'2px', marginBottom:'2px' }}>
              PRONUNCIATION PRACTICE
            </div>
            <div style={{ fontSize:'14px', color:'#888' }}>
              Speak Korean — get scored instantly
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {bestScore != null && (
              <div style={{ fontSize:'11px', color:'#555',
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:'8px', padding:'4px 10px' }}>
                🏆 Best: <span style={{ color:scoreColor(bestScore), fontWeight:'700' }}>
                  {bestScore}%
                </span>
              </div>
            )}
            <button onClick={onClose} style={{
              background:'transparent', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:'8px', color:'#666', fontSize:'13px',
              cursor:'pointer', padding:'5px 12px', fontFamily:'inherit',
            }}>✕ Close</button>
          </div>
        </div>

        <div style={{ padding:'22px' }}>
          {/* Target phrase */}
          <div style={{
            background:'rgba(255,255,255,0.02)',
            border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:'14px', padding:'18px 20px', marginBottom:'16px',
          }}>
            <div style={{ fontSize:'11px', color:'#444',
              fontWeight:'700', letterSpacing:'1px', marginBottom:'10px' }}>
              TARGET PHRASE
            </div>

            {/* Korean — big */}
            <div style={{ fontSize:'34px', fontWeight:'900', color:'#fff',
              fontFamily:"'Syne',sans-serif", marginBottom:'6px', lineHeight:1.2 }}>
              {line.korean}
            </div>

            {/* Romanization */}
            <div style={{ fontSize:'17px', color:accentColor,
              fontWeight:'600', marginBottom:'4px' }}>
              {line.romanization}
            </div>

            {/* English pronunciation */}
            <div style={{ fontSize:'14px', color:'#38bdf8',
              fontWeight:'600', marginBottom:'6px' }}>
              🗣 {line.englishPronunciation}
            </div>

            {/* English meaning */}
            <div style={{ fontSize:'15px', color:'#4ade80', fontWeight:'700',
              marginBottom:'16px' }}>
              {line.english}
            </div>

            {/* Listen buttons */}
            <div style={{ display:'flex', gap:'8px' }}>
              <button
                onClick={() => speakKorean(line.korean, false)}
                style={{
                  padding:'8px 18px', background:'rgba(233,69,96,0.12)',
                  border:'1px solid rgba(233,69,96,0.3)', borderRadius:'9px',
                  color:'#e94560', fontSize:'13px', fontWeight:'700',
                  cursor:'pointer', fontFamily:'inherit',
                }}>
                🔊 Normal speed
              </button>
              <button
                onClick={() => speakKorean(line.korean, true)}
                style={{
                  padding:'8px 18px', background:'rgba(56,189,248,0.1)',
                  border:'1px solid rgba(56,189,248,0.3)', borderRadius:'9px',
                  color:'#38bdf8', fontSize:'13px', fontWeight:'700',
                  cursor:'pointer', fontFamily:'inherit',
                }}>
                🐢 Slow speed
              </button>
            </div>
          </div>

          {/* Syllable breakdown */}
          <div style={{
            marginBottom:'16px', background:'rgba(255,255,255,0.02)',
            border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:'14px', padding:'16px 20px',
          }}>
            <div style={{ fontSize:'11px', color:'#444',
              fontWeight:'700', letterSpacing:'1px', marginBottom:'12px' }}>
              SYLLABLE BREAKDOWN — click to hear each one
            </div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {romanParts.map((syl, i) => {
                const mark = marks ? marks[i] : 'neutral';
                const st   = syllableStyle(mark, accentColor);
                return (
                  <div
                    key={i}
                    onClick={() => speakKorean(syl, false)}
                    style={{
                      padding:'10px 14px', borderRadius:'12px',
                      border:`1px solid ${st.borderColor}`,
                      background: st.background,
                      color: st.color,
                      cursor:'pointer', textAlign:'center',
                      minWidth:'56px', transition:'all 0.3s',
                    }}>
                    <div style={{ fontSize:'15px', fontWeight:'800',
                      fontFamily:"'Syne',sans-serif" }}>
                      {syl}
                    </div>
                    {line.words?.[i] && (
                      <div style={{ fontSize:'10px', marginTop:'2px', opacity:0.7 }}>
                        {line.words[i].k || ''}
                      </div>
                    )}
                    {marks && (
                      <div style={{ fontSize:'10px', marginTop:'3px', fontWeight:'700' }}>
                        {mark === 'correct' ? '✓' : mark === 'partial' ? '~' : '✗'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {heard && (
              <div style={{ marginTop:'12px', fontSize:'13px', color:'#555' }}>
                You said:{' '}
                <span style={{ color:'#f8d347', fontWeight:'700' }}>
                  "{heard}"
                </span>
              </div>
            )}
          </div>

          {/* Record + Score panel */}
          <div style={{
            display:'grid', gridTemplateColumns:'1fr auto',
            gap:'16px', alignItems:'center',
            background:'rgba(255,255,255,0.02)',
            border:`1px solid ${recording ? accentColor+'55' : 'rgba(255,255,255,0.07)'}`,
            borderRadius:'14px', padding:'18px 20px', marginBottom:'16px',
            transition:'border-color 0.3s',
          }}>
            <div>
              <div style={{ fontSize:'11px', color:'#444',
                fontWeight:'700', letterSpacing:'1px', marginBottom:'10px' }}>
                {recording ? 'LISTENING...' : 'PRESS TO RECORD'}
              </div>

              {/* Waveform */}
              <div style={{ display:'flex', alignItems:'flex-end',
                gap:'3px', height:'36px', marginBottom:'14px' }}>
                {waveHeights.map((h, i) => (
                  <div key={i} style={{
                    width:'4px', borderRadius:'2px',
                    height:`${h}px`,
                    background: recording ? accentColor : 'rgba(255,255,255,0.1)',
                    transition:'height 0.08s, background 0.3s',
                  }}/>
                ))}
              </div>

              <button
                onClick={recording ? stopRecording : startRecording}
                style={{
                  padding:'12px 32px', border:'none', borderRadius:'12px',
                  cursor:'pointer', fontFamily:"'Syne',sans-serif",
                  fontWeight:'800', fontSize:'15px', color:'#fff',
                  background: recording
                    ? 'linear-gradient(135deg,#4ade80,#22c55e)'
                    : `linear-gradient(135deg,${accentColor},${accentColor}bb)`,
                  boxShadow: recording
                    ? '0 4px 20px rgba(74,222,128,0.35)'
                    : `0 4px 20px ${accentColor}40`,
                  transition:'all 0.25s',
                }}>
                {recording ? '⏹ Stop' : '🎤 Record'}
              </button>

              {tip && (
                <div style={{ marginTop:'12px', fontSize:'13px',
                  color:'#888', lineHeight:1.5 }}>
                  {tip}
                </div>
              )}
            </div>

            {/* Score ring */}
            <div style={{ textAlign:'center' }}>
              <ScoreRing score={score} accent={accentColor} />
              <div style={{ fontSize:'11px', color:'#444', marginTop:'6px' }}>
                {score == null ? 'accuracy' :
                  score >= 80 ? 'Excellent!' :
                  score >= 60 ? 'Good try!' : 'Keep going!'}
              </div>
            </div>
          </div>

          {/* Attempt history */}
          {attempts.length > 0 && (
            <div style={{
              background:'rgba(255,255,255,0.02)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:'14px', padding:'16px 20px',
            }}>
              <div style={{ fontSize:'11px', color:'#444',
                fontWeight:'700', letterSpacing:'1px', marginBottom:'10px' }}>
                ATTEMPT HISTORY — {attempts.length} tries
              </div>
              {attempts.map((a, i) => {
                const c = a.score;
                const color = scoreColor(c);
                return (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:'10px',
                    padding:'8px 0',
                    borderBottom: i < attempts.length-1
                      ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <span style={{ fontSize:'12px', color:'#444', minWidth:'20px' }}>
                      #{i+1}
                    </span>
                    <span style={{ flex:1, fontSize:'13px', color:'#888',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      "{a.spoken}"
                    </span>
                    <div style={{ minWidth:'80px' }}>
                      <div style={{ height:'4px',
                        background:'rgba(255,255,255,0.06)',
                        borderRadius:'2px', overflow:'hidden',
                        marginBottom:'3px' }}>
                        <div style={{ width:`${a.score}%`, height:'100%',
                          background:color, borderRadius:'2px',
                          transition:'width 0.5s ease' }}/>
                      </div>
                      <span style={{ fontSize:'11px', color, fontWeight:'700' }}>
                        {a.score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}