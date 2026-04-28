import re

with open('frontend/src/kdrama/components/RelationshipHUD.jsx', 'r') as f:
    content = f.read()

if "import { useTheme }" not in content:
    content = content.replace("import { NPCS, getNPCArc } from '../data/npcs';", "import { NPCS, getNPCArc } from '../data/npcs';\nimport { useTheme } from '../../context/ThemeContext';")

content = re.sub(
    r"(export default function RelationshipHUD\(\)\s*{{)",
    r"\1\n  const { isDark } = useTheme();",
    content
)

content = content.replace(
    "background: 'rgba(0,0,0,0.6)',",
    "background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',"
)
content = content.replace(
    "border: '1px solid rgba(255,255,255,0.06)',",
    "border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.1)',"
)
content = content.replace(
    "color: '#ffffff',",
    "color: isDark ? '#ffffff' : '#333',"
)
content = content.replace(
    "? `linear-gradient(135deg, ${npc.color}12, rgba(0,0,0,0.7))`\n                    : 'rgba(0,0,0,0.65)',",
    "? `linear-gradient(135deg, ${npc.color}12, ${isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'})`\n                    : (isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)'),"
)
content = content.replace(
    "border: `1px solid ${isHere ? npc.color + '25' : 'rgba(255,255,255,0.05)'}`,",
    "border: `1px solid ${isHere ? npc.color + '25' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')}`,"
)
content = content.replace(
    "boxShadow: '0 4px 16px rgba(0,0,0,0.2)',",
    "boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.05)',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.35)',",
    "color: isDark ? 'rgba(255,255,255,0.35)' : '#666',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.5)',",
    "color: isDark ? 'rgba(255,255,255,0.5)' : '#555',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.3)',",
    "color: isDark ? 'rgba(255,255,255,0.3)' : '#888',"
)
content = content.replace(
    "background: 'rgba(255,255,255,0.06)',",
    "background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',"
)

with open('frontend/src/kdrama/components/RelationshipHUD.jsx', 'w') as f:
    f.write(content)
