const STORAGE_KEY_PALETTE = 'watchparty_palette_id';
const STORAGE_KEY_MODE = 'watchparty_theme_mode';
const STORAGE_KEY_ACCENT = 'watchparty_custom_accent';

export const DARK_PALETTES = [
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Clean neutral dark charcoal with calm blue accent',
    mode: 'dark',
    colors: {
      bgApp: '#121214',
      bgTopbar: 'rgba(20, 20, 24, 0.95)',
      bgCard: '#1a1a1e',
      bgCardSelected: '#23232a',
      bgInput: '#18181c',
      borderSubtle: 'rgba(255, 255, 255, 0.08)',
      borderCard: 'rgba(255, 255, 255, 0.1)',
      textMain: '#f4f4f5',
      textMuted: '#a1a1aa',
      accentPrimary: '#3b82f6',
      accentSecondary: '#60a5fa',
      glowColor: 'rgba(59, 130, 246, 0.15)',
      textOnAccent: '#ffffff'
    }
  },
  {
    id: 'midnight-slate',
    name: 'Midnight Slate',
    description: 'Deep cool oceanic navy with sky blue accent',
    mode: 'dark',
    colors: {
      bgApp: '#0f172a',
      bgTopbar: 'rgba(15, 23, 42, 0.95)',
      bgCard: '#1e293b',
      bgCardSelected: '#283548',
      bgInput: '#162032',
      borderSubtle: 'rgba(255, 255, 255, 0.08)',
      borderCard: 'rgba(255, 255, 255, 0.1)',
      textMain: '#f8fafc',
      textMuted: '#94a3b8',
      accentPrimary: '#38bdf8',
      accentSecondary: '#7dd3fc',
      glowColor: 'rgba(56, 189, 248, 0.15)',
      textOnAccent: '#000000'
    }
  },
  {
    id: 'warm-charcoal',
    name: 'Warm Charcoal',
    description: 'Cozy dark umber with warm amber accent',
    mode: 'dark',
    colors: {
      bgApp: '#171615',
      bgTopbar: 'rgba(26, 25, 23, 0.95)',
      bgCard: '#242220',
      bgCardSelected: '#302d2a',
      bgInput: '#1f1d1b',
      borderSubtle: 'rgba(255, 255, 255, 0.08)',
      borderCard: 'rgba(255, 255, 255, 0.1)',
      textMain: '#fafaf9',
      textMuted: '#a8a29e',
      accentPrimary: '#f59e0b',
      accentSecondary: '#fbbf24',
      glowColor: 'rgba(245, 158, 11, 0.15)',
      textOnAccent: '#000000'
    }
  },
  {
    id: 'forest-sage',
    name: 'Forest Sage',
    description: 'Quiet botanical green with muted mint',
    mode: 'dark',
    colors: {
      bgApp: '#111614',
      bgTopbar: 'rgba(20, 27, 23, 0.95)',
      bgCard: '#1a231e',
      bgCardSelected: '#232f28',
      bgInput: '#161f1a',
      borderSubtle: 'rgba(255, 255, 255, 0.08)',
      borderCard: 'rgba(255, 255, 255, 0.1)',
      textMain: '#f0fdf4',
      textMuted: '#a7f3d0',
      accentPrimary: '#10b981',
      accentSecondary: '#34d399',
      glowColor: 'rgba(16, 185, 129, 0.15)',
      textOnAccent: '#ffffff'
    }
  },
  {
    id: 'pitch-black',
    name: 'Pitch Black',
    description: 'OLED high contrast black with crisp white accent',
    mode: 'dark',
    colors: {
      bgApp: '#000000',
      bgTopbar: 'rgba(14, 14, 14, 0.95)',
      bgCard: '#121212',
      bgCardSelected: '#1e1e1e',
      bgInput: '#0d0d0d',
      borderSubtle: 'rgba(255, 255, 255, 0.12)',
      borderCard: 'rgba(255, 255, 255, 0.14)',
      textMain: '#ffffff',
      textMuted: '#a1a1aa',
      accentPrimary: '#ffffff',
      accentSecondary: '#d4d4d8',
      glowColor: 'rgba(255, 255, 255, 0.1)',
      textOnAccent: '#000000'
    }
  }
];

export const LIGHT_PALETTES = [
  {
    id: 'paper',
    name: 'Paper',
    description: 'Clean off-white with slate text and royal blue',
    mode: 'light',
    colors: {
      bgApp: '#fafafa',
      bgTopbar: 'rgba(255, 255, 255, 0.92)',
      bgCard: '#ffffff',
      bgCardSelected: '#f4f4f5',
      bgInput: '#f4f4f5',
      borderSubtle: 'rgba(0, 0, 0, 0.08)',
      borderCard: 'rgba(0, 0, 0, 0.09)',
      textMain: '#18181b',
      textMuted: '#71717a',
      accentPrimary: '#2563eb',
      accentSecondary: '#3b82f6',
      glowColor: 'rgba(37, 99, 235, 0.1)',
      textOnAccent: '#ffffff'
    }
  },
  {
    id: 'warm-sand',
    name: 'Warm Sand',
    description: 'Warm natural cream with gentle amber',
    mode: 'light',
    colors: {
      bgApp: '#fbfaf8',
      bgTopbar: 'rgba(255, 255, 255, 0.92)',
      bgCard: '#ffffff',
      bgCardSelected: '#f5f3ef',
      bgInput: '#f3f1ec',
      borderSubtle: 'rgba(0, 0, 0, 0.07)',
      borderCard: 'rgba(0, 0, 0, 0.08)',
      textMain: '#292524',
      textMuted: '#78716c',
      accentPrimary: '#d97706',
      accentSecondary: '#b45309',
      glowColor: 'rgba(217, 119, 6, 0.1)',
      textOnAccent: '#ffffff'
    }
  },
  {
    id: 'cool-slate',
    name: 'Cool Slate',
    description: 'Fresh morning gray with breezy sky blue',
    mode: 'light',
    colors: {
      bgApp: '#f8fafc',
      bgTopbar: 'rgba(255, 255, 255, 0.92)',
      bgCard: '#ffffff',
      bgCardSelected: '#f1f5f9',
      bgInput: '#f1f5f9',
      borderSubtle: 'rgba(0, 0, 0, 0.07)',
      borderCard: 'rgba(0, 0, 0, 0.08)',
      textMain: '#0f172a',
      textMuted: '#64748b',
      accentPrimary: '#0284c7',
      accentSecondary: '#38bdf8',
      glowColor: 'rgba(2, 132, 199, 0.1)',
      textOnAccent: '#ffffff'
    }
  },
  {
    id: 'matcha-tea',
    name: 'Matcha Tea',
    description: 'Soft herbal tea green with forest sage',
    mode: 'light',
    colors: {
      bgApp: '#f6f8f6',
      bgTopbar: 'rgba(255, 255, 255, 0.92)',
      bgCard: '#ffffff',
      bgCardSelected: '#eef2ee',
      bgInput: '#eef2ee',
      borderSubtle: 'rgba(0, 0, 0, 0.07)',
      borderCard: 'rgba(0, 0, 0, 0.08)',
      textMain: '#142017',
      textMuted: '#586a5d',
      accentPrimary: '#059669',
      accentSecondary: '#10b981',
      glowColor: 'rgba(5, 150, 105, 0.1)',
      textOnAccent: '#ffffff'
    }
  }
];

/**
 * Calculates optimal text color (#000000 or #ffffff) based on human eye perceived luminance (YIQ)
 */
export function getContrastTextColor(hexColor) {
  if (!hexColor) return '#ffffff';
  const hex = hexColor.replace('#', '').trim();
  let r = 255, g = 255, b = 255;
  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#000000' : '#ffffff';
}

/**
 * Applies palette and custom accent directly to CSS root variables
 */
export function applyPalette(palette, customAccent = null) {
  if (!palette) return;

  const root = document.documentElement;
  const colors = palette.colors;
  const primaryAccent = (customAccent && customAccent.trim()) || colors.accentPrimary;
  const textOnAccent = customAccent && customAccent.trim()
    ? getContrastTextColor(primaryAccent)
    : colors.textOnAccent || (palette.id === 'pitch-black' ? '#000000' : '#ffffff');

  if (palette.mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.setProperty('color-scheme', 'dark');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.style.setProperty('color-scheme', 'light');
  }

  root.style.setProperty('--bg-app', colors.bgApp);
  root.style.setProperty('--bg-topbar', colors.bgTopbar);
  root.style.setProperty('--bg-card', colors.bgCard);
  root.style.setProperty('--bg-card-selected', colors.bgCardSelected);
  root.style.setProperty('--bg-input', colors.bgInput);
  root.style.setProperty('--border-subtle', colors.borderSubtle);
  root.style.setProperty('--border-card', colors.borderCard);
  root.style.setProperty('--border-selected', primaryAccent);
  root.style.setProperty('--text-main', colors.textMain);
  root.style.setProperty('--text-muted', colors.textMuted);
  root.style.setProperty('--accent-primary', primaryAccent);
  root.style.setProperty('--accent-secondary', colors.accentSecondary);
  root.style.setProperty('--glow-color', customAccent ? `${customAccent}26` : colors.glowColor);
  root.style.setProperty('--text-on-accent', textOnAccent);

  // Persist selections
  localStorage.setItem(STORAGE_KEY_PALETTE, palette.id);
  localStorage.setItem(STORAGE_KEY_MODE, palette.mode);
  if (customAccent) {
    localStorage.setItem(STORAGE_KEY_ACCENT, customAccent);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACCENT);
  }
}

/**
 * Initialize theme from localStorage or default to graphite dark
 */
export function initTheme() {
  const savedMode = localStorage.getItem(STORAGE_KEY_MODE) || 'dark';
  const savedPaletteId = localStorage.getItem(STORAGE_KEY_PALETTE) || 'graphite';
  const savedAccent = localStorage.getItem(STORAGE_KEY_ACCENT) || null;

  const palettes = savedMode === 'dark' ? DARK_PALETTES : LIGHT_PALETTES;
  let palette = palettes.find(p => p.id === savedPaletteId);
  if (!palette) {
    palette = DARK_PALETTES[0];
  }

  applyPalette(palette, savedAccent);

  return {
    mode: savedMode,
    paletteId: palette.id,
    customAccent: savedAccent
  };
}

export function getCurrentThemeState() {
  const mode = localStorage.getItem(STORAGE_KEY_MODE) || 'dark';
  const paletteId = localStorage.getItem(STORAGE_KEY_PALETTE) || 'graphite';
  const customAccent = localStorage.getItem(STORAGE_KEY_ACCENT) || '';
  return { mode, paletteId, customAccent };
}
