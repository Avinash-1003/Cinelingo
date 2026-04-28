import re

with open('frontend/src/kdrama/KDramaGame.jsx', 'r') as f:
    content = f.read()

# 1. Add import
if "import { useTheme }" not in content:
    content = content.replace(
        "import { WordCard } from './components/LanguageDisplay';",
        "import { WordCard } from './components/LanguageDisplay';\nimport { useTheme } from '../context/ThemeContext';"
    )

# 2. Add useTheme to components
def add_hook(comp_name, code):
    return re.sub(
        rf"(function {comp_name}\([^)]*\)\s*{{)",
        r"\1\n  const { isDark } = useTheme();",
        code
    )

content = add_hook('MainMenu', content)
content = add_hook('GameHUD', content)
content = add_hook('EpisodeCompleteOverlay', content)
content = add_hook('AchievementNotification', content)
content = re.sub(
    r"(export default function KDramaGame\(\)\s*{{)",
    r"\1\n  const { isDark } = useTheme();",
    content
)

# 3. MainMenu replacements
content = content.replace(
    "'linear-gradient(180deg, #050510 0%, #0a0f1e 40%, #0f0a18 70%, #050510 100%)'",
    "isDark ? 'linear-gradient(180deg, #050510 0%, #0a0f1e 40%, #0f0a18 70%, #050510 100%)' : 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 40%, #f4f4f9 70%, #f0f4f8 100%)'"
)
content = content.replace("color: 'rgba(255,255,255,0.2)',", "color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',")
content = content.replace("color: 'rgba(255,255,255,0.35)',", "color: isDark ? 'rgba(255,255,255,0.35)' : '#666',")
content = content.replace("color: 'rgba(255,255,255,0.1)',", "color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',")
content = content.replace("border: '1px solid rgba(255,255,255,0.06)',", "border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',")

# 4. HUD top bar
content = content.replace(
    "background: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)',",
    "background: isDark ? 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)' : 'linear-gradient(180deg, rgba(255,255,255,0.85), transparent)',"
)
content = content.replace(
    "background: 'rgba(0,0,0,0.4)'",
    "background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)'"
)
content = content.replace(
    "color: '#ffffff',",
    "color: isDark ? '#ffffff' : '#333',"
)
content = content.replace(
    "background: 'rgba(0,0,0,0.3)',",
    "background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.5)',",
    "color: isDark ? 'rgba(255,255,255,0.5)' : '#555',"
)

# 5. HUD Vocab panel
content = content.replace(
    "background: 'rgba(0,0,0,0.85)'",
    "background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)'"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.3)',",
    "color: isDark ? 'rgba(255,255,255,0.3)' : '#888',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.2)',",
    "color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.15)',",
    "color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.4)',"
)

# 6. Episode overlay
content = content.replace(
    "background: 'rgba(0,0,0,0.9)',",
    "background: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',"
)
content = content.replace(
    "color: episode?.coverColor || '#ffffff',",
    "color: isDark ? (episode?.coverColor || '#ffffff') : (episode?.coverColor || '#222'),"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.4)',\n          fontStyle: 'italic',",
    "color: isDark ? 'rgba(255,255,255,0.4)' : '#666',\n          fontStyle: 'italic',"
)
content = content.replace(
    "color: 'rgba(255,255,255,0.6)',",
    "color: isDark ? 'rgba(255,255,255,0.6)' : '#444',"
)

# 7. Loading / KDramaGame wrapper
content = content.replace(
    "background: '#050510',",
    "background: isDark ? '#050510' : '#f4f4f9',"
)
content = content.replace(
    "background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(0,0,0,0.85))'",
    "background: isDark ? 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(0,0,0,0.85))' : 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,255,255,0.9))'"
)

with open('frontend/src/kdrama/KDramaGame.jsx', 'w') as f:
    f.write(content)
