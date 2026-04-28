import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// ── Theme color tokens ───────────────────────────────────────────────────────
const THEMES = {
  dark: {
    '--bg-primary': '#08081a',
    '--bg-secondary': '#0d0d22',
    '--bg-card': 'rgba(255,255,255,0.03)',
    '--bg-card-hover': 'rgba(255,255,255,0.06)',
    '--bg-input': 'rgba(255,255,255,0.05)',
    '--bg-nav': 'rgba(8,8,26,0.95)',
    '--bg-dropdown': '#13132a',
    '--border-primary': 'rgba(255,255,255,0.07)',
    '--border-input': 'rgba(255,255,255,0.1)',
    '--border-accent': 'rgba(233,69,96,0.2)',
    '--text-primary': '#ffffff',
    '--text-secondary': '#cccccc',
    '--text-muted': '#888888',
    '--text-dim': '#555555',
    '--text-faint': '#333333',
    '--accent': '#e94560',
    '--accent-dark': '#c73652',
    '--accent-glow': 'rgba(233,69,96,0.35)',
    '--success': '#4ade80',
    '--warning': '#f8d347',
    '--info': '#38bdf8',
    '--shadow-card': '0 8px 32px rgba(0,0,0,0.5)',
    '--shadow-btn': '0 4px 28px rgba(233,69,96,0.35)',
    '--glass-bg': 'rgba(255,255,255,0.03)',
    '--glass-border': 'rgba(255,255,255,0.07)',
    '--overlay': 'rgba(0,0,0,0.5)',
  },
  light: {
    '--bg-primary': '#f5f5f7',
    '--bg-secondary': '#eaeaef',
    '--bg-card': 'rgba(255,255,255,0.85)',
    '--bg-card-hover': 'rgba(255,255,255,1)',
    '--bg-input': 'rgba(0,0,0,0.04)',
    '--bg-nav': 'rgba(255,255,255,0.92)',
    '--bg-dropdown': '#ffffff',
    '--border-primary': 'rgba(0,0,0,0.08)',
    '--border-input': 'rgba(0,0,0,0.12)',
    '--border-accent': 'rgba(233,69,96,0.2)',
    '--text-primary': '#1a1a2e',
    '--text-secondary': '#2d2d44',
    '--text-muted': '#666680',
    '--text-dim': '#8888a0',
    '--text-faint': '#aaaabc',
    '--accent': '#e94560',
    '--accent-dark': '#c73652',
    '--accent-glow': 'rgba(233,69,96,0.2)',
    '--success': '#22c55e',
    '--warning': '#eab308',
    '--info': '#0ea5e9',
    '--shadow-card': '0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
    '--shadow-btn': '0 4px 20px rgba(233,69,96,0.2)',
    '--glass-bg': 'rgba(255,255,255,0.7)',
    '--glass-border': 'rgba(0,0,0,0.06)',
    '--overlay': 'rgba(0,0,0,0.3)',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('cinelingo_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('cinelingo_theme', next); } catch {}
      return next;
    });
  };

  // Apply CSS custom properties to document root
  useEffect(() => {
    const tokens = THEMES[theme] || THEMES.dark;
    const root = document.documentElement;
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
