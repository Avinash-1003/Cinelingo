import re

with open('frontend/src/kdrama/components/EpisodeTracker.jsx', 'r') as f:
    content = f.read()

if "import { useTheme }" not in content:
    content = content.replace("import { EPISODES, isEpisodeUnlocked } from '../data/episodes';", "import { EPISODES, isEpisodeUnlocked } from '../data/episodes';\nimport { useTheme } from '../../context/ThemeContext';")

content = re.sub(
    r"(export default function EpisodeTracker\([^)]*\)\s*{{)",
    r"\1\n  const { isDark } = useTheme();",
    content
)

content = content.replace("'linear-gradient(180deg, rgba(5,5,16,0.97), rgba(5,5,16,0.99))'", "isDark ? 'linear-gradient(180deg, rgba(5,5,16,0.97), rgba(5,5,16,0.99))' : 'linear-gradient(180deg, rgba(255,255,255,0.93), rgba(255,255,255,0.97))'")
content = content.replace("color: 'rgba(255,255,255,0.25)',", "color: isDark ? 'rgba(255,255,255,0.25)' : '#888',")
content = content.replace("color: '#ffffff',", "color: isDark ? '#ffffff' : '#111',")
content = content.replace("color: 'rgba(255,255,255,0.4)',", "color: isDark ? 'rgba(255,255,255,0.4)' : '#666',")

content = content.replace("background: 'rgba(255,255,255,0.03)',", "background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',")
content = content.replace("border: '1px solid rgba(255,255,255,0.05)',", "border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)',")
content = content.replace("color: 'rgba(255,255,255,0.3)',", "color: isDark ? 'rgba(255,255,255,0.3)' : '#888',")

content = content.replace("? `linear-gradient(135deg, ${ep.coverColor}10, rgba(0,0,0,0.5))`", "? `linear-gradient(135deg, ${ep.coverColor}10, ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'})`")
content = content.replace("? 'rgba(255,255,255,0.03)'\n                    : 'rgba(255,255,255,0.01)',", "? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)')\n                    : (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'),")
content = content.replace("border: `1px solid ${completed ? ep.coverColor + '30' : unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'}`,", "border: `1px solid ${completed ? ep.coverColor + '30' : unlocked ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)')}`,")

content = content.replace("? 'rgba(255,255,255,0.04)',", "? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),")
content = content.replace("border: completed ? 'none' : '1px solid rgba(255,255,255,0.06)',", "border: completed ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)'),")

content = content.replace("color: completed ? ep.coverColor : '#ffffff',", "color: completed ? ep.coverColor : (isDark ? '#ffffff' : '#111'),")
content = content.replace("color: 'rgba(255,255,255,0.35)',", "color: isDark ? 'rgba(255,255,255,0.35)' : '#777',")
content = content.replace("color: 'rgba(255,255,255,0.5)',", "color: isDark ? 'rgba(255,255,255,0.5)' : '#555',")
content = content.replace("color: 'rgba(255,255,255,0.2)',", "color: isDark ? 'rgba(255,255,255,0.2)' : '#888',")

with open('frontend/src/kdrama/components/EpisodeTracker.jsx', 'w') as f:
    f.write(content)
