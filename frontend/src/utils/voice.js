/**
 * Shared Korean voice synthesis utility.
 * Stores the user's preferred voice in localStorage.
 */

const VOICE_KEY = 'cinelingo_preferred_voice';

/** Get all available Korean voices */
export function getKoreanVoices() {
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('ko'));
}

/** Get the stored preferred voice name (or null) */
export function getPreferredVoiceName() {
  return localStorage.getItem(VOICE_KEY) || null;
}

/** Set the preferred voice name */
export function setPreferredVoiceName(name) {
  if (name) localStorage.setItem(VOICE_KEY, name);
  else localStorage.removeItem(VOICE_KEY);
}

/** Resolve the preferred voice object from the available voices */
function resolveVoice() {
  const voices = getKoreanVoices();
  if (!voices.length) return null;
  const preferred = getPreferredVoiceName();
  if (preferred) {
    const match = voices.find(v => v.name === preferred);
    if (match) return match;
  }
  return voices[0]; // default to first Korean voice
}

/**
 * Speak Korean text using the user's preferred voice.
 * @param {string} text - text to speak
 * @param {boolean} [slow=false] - speak slowly
 */
export function speakKorean(text, slow = false) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = slow ? 0.45 : 0.85;
  u.pitch = 1.1;
  const voice = resolveVoice();
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}
