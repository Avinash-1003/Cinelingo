import re

with open('frontend/src/kdrama/components/DialoguePanel.jsx', 'r') as f:
    content = f.read()

if "import { useTheme }" not in content:
    content = content.replace(
        "import LanguageDisplay from './LanguageDisplay';",
        "import LanguageDisplay from './LanguageDisplay';\nimport { useTheme } from '../../context/ThemeContext';"
    )

content = re.sub(
    r"(export default function DialoguePanel\(\)\s*{{)",
    r"\1\n  const { isDark } = useTheme();",
    content
)

content = content.replace(
    "background: isNarration\n            ? 'linear-gradient(180deg, rgba(10,10,30,0.85), rgba(10,10,30,0.95))'\n            : 'linear-gradient(180deg, rgba(10,10,30,0.8), rgba(10,10,30,0.95))',",
    "background: isNarration\n            ? (isDark ? 'linear-gradient(180deg, rgba(10,10,30,0.85), rgba(10,10,30,0.95))' : 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.95))')\n            : (isDark ? 'linear-gradient(180deg, rgba(10,10,30,0.8), rgba(10,10,30,0.95))' : 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.95))'),"
)

content = content.replace(
    "border: `1px solid ${speaker ? `${speaker.color}22` : 'rgba(255,255,255,0.06)'}`,",
    "border: `1px solid ${speaker ? `${speaker.color}22` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,"
)

content = content.replace(
    "boxShadow: `0 -8px 40px rgba(0,0,0,0.4), ${speaker ? `0 0 60px ${speaker.color}08` : ''}`,",
    "boxShadow: `0 -8px 40px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)'}, ${speaker ? `0 0 60px ${speaker.color}08` : ''}`,"
)

content = content.replace(
    "color: 'rgba(255,255,255,0.35)',",
    "color: isDark ? 'rgba(255,255,255,0.35)' : '#666',"
)
content = content.replace(
    "background: 'rgba(255,255,255,0.04)',\n                border: '1px solid rgba(255,255,255,0.06)',",
    "background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',\n                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.4)',",
    "color: isDark ? 'rgba(255,255,255,0.4)' : '#666',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.25)',",
    "color: isDark ? 'rgba(255,255,255,0.25)' : '#888',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.85)',",
    "color: isDark ? 'rgba(255,255,255,0.85)' : '#333',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.2)',",
    "color: isDark ? 'rgba(255,255,255,0.2)' : '#888',"
)

content = content.replace(
    "? `linear-gradient(135deg, ${speaker?.color || '#00e5ff'}15, ${speaker?.color || '#00e5ff'}08)`\n                    : 'rgba(255,255,255,0.03)',",
    "? `linear-gradient(135deg, ${speaker?.color || '#00e5ff'}15, ${speaker?.color || '#00e5ff'}08)`\n                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),"
)
content = content.replace(
    "border: `1px solid ${hoveredChoice === choice.id ? (speaker?.color || '#00e5ff') + '40' : 'rgba(255,255,255,0.06)'}`,",
    "border: `1px solid ${hoveredChoice === choice.id ? (speaker?.color || '#00e5ff') + '40' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,"
)
content = content.replace(
    "color: hoveredChoice === choice.id ? '#ffffff' : 'rgba(255,255,255,0.75)',",
    "color: hoveredChoice === choice.id ? (isDark ? '#ffffff' : '#000') : (isDark ? 'rgba(255,255,255,0.75)' : '#444'),"
)
content = content.replace(
    "color: hoveredChoice === choice.id ? (speaker?.color || '#00e5ff') : 'rgba(255,255,255,0.5)',",
    "color: hoveredChoice === choice.id ? (speaker?.color || '#00e5ff') : (isDark ? 'rgba(255,255,255,0.5)' : '#666'),"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.3)',",
    "color: isDark ? 'rgba(255,255,255,0.3)' : '#888',"
)

with open('frontend/src/kdrama/components/DialoguePanel.jsx', 'w') as f:
    f.write(content)
