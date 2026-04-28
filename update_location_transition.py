import re

with open('frontend/src/kdrama/components/LocationTransition.jsx', 'r') as f:
    content = f.read()

if "import { useTheme }" not in content:
    content = content.replace("import { useGameStore } from '../store/gameStore';", "import { useGameStore } from '../store/gameStore';\nimport { useTheme } from '../../context/ThemeContext';")

content = re.sub(
    r"(export default function LocationTransition\(\)\s*{{)",
    r"\1\n  const { isDark } = useTheme();",
    content
)
content = re.sub(
    r"(export function LocationMap\(\)\s*{{)",
    r"\1\n  const { isDark } = useTheme();",
    content
)


# LocationTransition
content = content.replace(
    "background: isTransitioning\n        ? 'rgba(0,0,0,0.95)'\n        : 'rgba(0,0,0,0)',",
    "background: isTransitioning\n        ? (isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)')\n        : 'rgba(0,0,0,0)',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.4)'",
    "color: isDark ? 'rgba(255,255,255,0.4)' : '#666'"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.25)'",
    "color: isDark ? 'rgba(255,255,255,0.25)' : '#888'"
)


# LocationMap
content = content.replace(
    "background: 'rgba(0,0,0,0.85)'",
    "background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)'"
)
content = content.replace(
    "color: '#ffffff',",
    "color: isDark ? '#ffffff' : '#111',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.35)',",
    "color: isDark ? 'rgba(255,255,255,0.35)' : '#777',"
)
content = content.replace(
    "background: 'rgba(255,255,255,0.05)'",
    "background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
)
content = content.replace(
    "border: '1px solid rgba(255,255,255,0.1)'",
    "border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'"
)
content = content.replace(
    "? `linear-gradient(135deg, ${meta.color}15, rgba(0,0,0,0.5))`\n                    : 'rgba(255,255,255,0.03)',",
    "? `linear-gradient(135deg, ${meta.color}15, ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)'})`\n                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),"
)
content = content.replace(
    "border: `1px solid ${isHere ? meta.color + '30' : 'rgba(255,255,255,0.06)'}`,",
    "border: `1px solid ${isHere ? meta.color + '30' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`,"
)
content = content.replace(
    "background: isHere ? `${meta.color}15` : 'rgba(255,255,255,0.03)',",
    "background: isHere ? `${meta.color}15` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),"
)
content = content.replace(
    "border: `1px solid ${isHere ? meta.color + '25' : 'rgba(255,255,255,0.04)'}`,",
    "border: `1px solid ${isHere ? meta.color + '25' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)')}`,"
)
content = content.replace(
    "color: isHere ? meta.color : '#ffffff',",
    "color: isHere ? meta.color : (isDark ? '#ffffff' : '#111'),"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.2)',",
    "color: isDark ? 'rgba(255,255,255,0.2)' : '#888',"
)

with open('frontend/src/kdrama/components/LocationTransition.jsx', 'w') as f:
    f.write(content)
