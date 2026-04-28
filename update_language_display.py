import re

with open('frontend/src/kdrama/components/LanguageDisplay.jsx', 'r') as f:
    content = f.read()

# Append import
if "import { useTheme }" not in content:
    content = content.replace("import { getWordById } from '../data/vocabulary';", "import { getWordById } from '../data/vocabulary';\nimport { useTheme } from '../../context/ThemeContext';")

# Refactor styles object to getStyles function
style_block = """const getStyles = (isDark) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'flex-start',
  },
  koreanLine: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 'var(--korean-size, 22px)',
    fontWeight: 500,
    lineHeight: 1.6,
    color: isDark ? '#ffffff' : '#111',
    letterSpacing: '0.5px',
  },
  phoneticLine: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 'var(--phonetic-size, 14px)',
    fontWeight: 400,
    color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#666',
    fontStyle: 'italic',
    letterSpacing: '0.3px',
  },
  highlightedWord: {
    color: isDark ? '#00e5ff' : '#008b9c',
    textShadow: isDark ? '0 0 12px rgba(0, 229, 255, 0.3)' : 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: isDark ? '1px dashed rgba(0, 229, 255, 0.3)' : '1px dashed rgba(0, 139, 156, 0.5)',
    paddingBottom: '1px',
  },
  wordTooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: isDark ? 'rgba(0, 0, 0, 0.92)' : 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(16px)',
    border: isDark ? '1px solid rgba(0, 229, 255, 0.2)' : '1px solid rgba(0, 139, 156, 0.3)',
    borderRadius: '10px',
    padding: '10px 14px',
    minWidth: '140px',
    zIndex: 100,
    animation: 'fadeScale 0.2s ease',
    boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  wordTooltipKorean: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: '18px',
    fontWeight: 600,
    color: isDark ? '#ffffff' : '#111',
    marginBottom: '4px',
  },
  wordTooltipPhonetic: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: isDark ? '#00e5ff' : '#008b9c',
    fontStyle: 'italic',
  },
  wordTooltipLearned: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#666',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  learnBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    background: isDark ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0, 139, 156, 0.1)',
    color: isDark ? '#00e5ff' : '#008b9c',
    border: isDark ? '1px solid rgba(0, 229, 255, 0.2)' : '1px solid rgba(0, 139, 156, 0.3)',
  },
});"""

content = re.sub(r"const styles = \{.*?^\};", style_block, content, flags=re.MULTILINE|re.DOTALL)

# Update HighlightableText to useTheme and getStyles
content = content.replace("function HighlightableText({ korean, phonetic, highlightWords = [], learnWordIds = [] }) {", 
                          "function HighlightableText({ korean, phonetic, highlightWords = [], learnWordIds = [] }) {\n  const { isDark } = useTheme();\n  const styles = getStyles(isDark);")

# Update LanguageDisplay to useTheme and getStyles
content = content.replace("export default function LanguageDisplay({ korean, phonetic, highlightWords, learnWordIds, size = 'normal' }) {",
                          "export default function LanguageDisplay({ korean, phonetic, highlightWords, learnWordIds, size = 'normal' }) {\n  const { isDark } = useTheme();\n  const styles = getStyles(isDark);")


# WordCard component updates
wordcard_original = """export function WordCard({ wordId }) {
  const word = getWordById(wordId);
  const learnedWords = useGameStore(s => s.learnedWords);

  if (!word) return null;
  const isLearned = learnedWords.includes(wordId);

  return (
    <div style={{
      padding: '12px 16px',
      background: isLearned
        ? 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(0,229,255,0.02))'
        : 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      border: `1px solid ${isLearned ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '18px',
          fontWeight: 600,
          color: word.highlight ? '#00e5ff' : '#ffffff',
        }}>
          {word.korean}
        </span>
        {isLearned && (
          <span style={styles.learnBadge}>✅ Learned</span>
        )}
      </div>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '13px',
        color: 'rgba(255,255,255,0.5)',
        fontStyle: 'italic',
      }}>
        {word.phonetic}
      </span>
    </div>
  );
}"""

wordcard_new = """export function WordCard({ wordId }) {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);
  const word = getWordById(wordId);
  const learnedWords = useGameStore(s => s.learnedWords);

  if (!word) return null;
  const isLearned = learnedWords.includes(wordId);

  return (
    <div style={{
      padding: '12px 16px',
      background: isLearned
        ? (isDark ? 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(0,229,255,0.02))' : 'linear-gradient(135deg, rgba(0,139,156,0.1), rgba(0,139,156,0.05))')
        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
      borderRadius: '12px',
      border: `1px solid ${isLearned ? (isDark ? 'rgba(0,229,255,0.2)' : 'rgba(0,139,156,0.3)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: '18px',
          fontWeight: 600,
          color: word.highlight ? (isDark ? '#00e5ff' : '#008b9c') : (isDark ? '#ffffff' : '#111'),
        }}>
          {word.korean}
        </span>
        {isLearned && (
          <span style={styles.learnBadge}>✅ Learned</span>
        )}
      </div>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '13px',
        color: isDark ? 'rgba(255,255,255,0.5)' : '#666',
        fontStyle: 'italic',
      }}>
        {word.phonetic}
      </span>
    </div>
  );
}"""

content = content.replace(wordcard_original, wordcard_new)

with open('frontend/src/kdrama/components/LanguageDisplay.jsx', 'w') as f:
    f.write(content)
