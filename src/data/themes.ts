export interface ThemeDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  isDark: boolean;
  isMinimalMonochrome?: boolean;
  palette: {
    bgApp: string;
    bgSurface: string;
    bgSurfaceSubtle: string;
    bgSurfaceElevated: string;
    borderSubtle: string;
    borderStrong: string;
    textMain: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentText: string;
    accentHover: string;
    accentSubtle: string;
    accentRing: string;
  };
  preview: {
    bg: string;
    surface: string;
    border: string;
    accent: string;
    text: string;
  };
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'mono-oled',
    name: 'Monochrome OLED',
    shortName: 'B&W OLED',
    description: 'Pure pitch black with stark white accents. Minimal, high-contrast, distraction-free.',
    isDark: true,
    isMinimalMonochrome: true,
    palette: {
      bgApp: '#000000',
      bgSurface: '#09090b',
      bgSurfaceSubtle: '#121215',
      bgSurfaceElevated: '#1a1a1e',
      borderSubtle: '#222226',
      borderStrong: '#383842',
      textMain: '#ffffff',
      textSecondary: '#a1a1aa',
      textMuted: '#71717a',
      accent: '#ffffff',
      accentText: '#000000',
      accentHover: '#e4e4e7',
      accentSubtle: 'rgba(255, 255, 255, 0.12)',
      accentRing: 'rgba(255, 255, 255, 0.35)',
    },
    preview: {
      bg: '#000000',
      surface: '#09090b',
      border: '#27272a',
      accent: '#ffffff',
      text: '#ffffff',
    },
  },
  {
    id: 'mono-paper',
    name: 'Minimal Clean Paper',
    shortName: 'B&W Paper',
    description: 'Crisp gallery white background with deep carbon black typography and borders.',
    isDark: false,
    isMinimalMonochrome: true,
    palette: {
      bgApp: '#ffffff',
      bgSurface: '#ffffff',
      bgSurfaceSubtle: '#f4f4f5',
      bgSurfaceElevated: '#ffffff',
      borderSubtle: '#e4e4e7',
      borderStrong: '#d4d4d8',
      textMain: '#09090b',
      textSecondary: '#52525b',
      textMuted: '#71717a',
      accent: '#09090b',
      accentText: '#ffffff',
      accentHover: '#27272a',
      accentSubtle: 'rgba(9, 9, 11, 0.08)',
      accentRing: 'rgba(9, 9, 11, 0.25)',
    },
    preview: {
      bg: '#ffffff',
      surface: '#f4f4f5',
      border: '#e4e4e7',
      accent: '#09090b',
      text: '#09090b',
    },
  },
  {
    id: 'graphite-slate',
    name: 'Graphite Titanium',
    shortName: 'Graphite',
    description: 'Matte dark slate chassis with refined titanium silver borders and highlights.',
    isDark: true,
    palette: {
      bgApp: '#090a0d',
      bgSurface: '#12141a',
      bgSurfaceSubtle: '#1a1e27',
      bgSurfaceElevated: '#232834',
      borderSubtle: '#242b38',
      borderStrong: '#394458',
      textMain: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#e2e8f0',
      accentText: '#0f172a',
      accentHover: '#cbd5e1',
      accentSubtle: 'rgba(226, 232, 240, 0.14)',
      accentRing: 'rgba(226, 232, 240, 0.35)',
    },
    preview: {
      bg: '#090a0d',
      surface: '#12141a',
      border: '#334155',
      accent: '#e2e8f0',
      text: '#f1f5f9',
    },
  },
  {
    id: 'hevy-crimson',
    name: 'Hevy Power Red',
    shortName: 'Hevy Red',
    description: 'Signature gym tracking chassis with aggressive athletic vermilion red buttons.',
    isDark: true,
    palette: {
      bgApp: '#0a0a0c',
      bgSurface: '#131317',
      bgSurfaceSubtle: '#1d1c22',
      bgSurfaceElevated: '#26242c',
      borderSubtle: '#27242c',
      borderStrong: '#3e3947',
      textMain: '#fafaf9',
      textSecondary: '#a8a29e',
      textMuted: '#78716c',
      accent: '#ef4444',
      accentText: '#ffffff',
      accentHover: '#dc2626',
      accentSubtle: 'rgba(239, 68, 68, 0.15)',
      accentRing: 'rgba(239, 68, 68, 0.35)',
    },
    preview: {
      bg: '#0a0a0c',
      surface: '#131317',
      border: '#3e3947',
      accent: '#ef4444',
      text: '#fafaf9',
    },
  },
  {
    id: 'electric-cobalt',
    name: 'Electric Cobalt',
    shortName: 'Cobalt',
    description: 'Deep midnight navy obsidian with sharp precision electric cobalt highlights.',
    isDark: true,
    palette: {
      bgApp: '#05070d',
      bgSurface: '#0b101a',
      bgSurfaceSubtle: '#121a2a',
      bgSurfaceElevated: '#1b263d',
      borderSubtle: '#1a273e',
      borderStrong: '#2b3f63',
      textMain: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#3b82f6',
      accentText: '#ffffff',
      accentHover: '#2563eb',
      accentSubtle: 'rgba(59, 130, 246, 0.16)',
      accentRing: 'rgba(59, 130, 246, 0.35)',
    },
    preview: {
      bg: '#05070d',
      surface: '#0b101a',
      border: '#1e3a8a',
      accent: '#3b82f6',
      text: '#f8fafc',
    },
  },
  {
    id: 'tactical-amber',
    name: 'Tactical Amber',
    shortName: 'Amber Gold',
    description: 'Black carbon matte chassis with high-visibility tactical gold contrast.',
    isDark: true,
    palette: {
      bgApp: '#090806',
      bgSurface: '#12100b',
      bgSurfaceSubtle: '#1c1912',
      bgSurfaceElevated: '#272219',
      borderSubtle: '#2a2419',
      borderStrong: '#423927',
      textMain: '#fefce8',
      textSecondary: '#d4d4d8',
      textMuted: '#71717a',
      accent: '#f59e0b',
      accentText: '#090806',
      accentHover: '#d97706',
      accentSubtle: 'rgba(245, 158, 11, 0.16)',
      accentRing: 'rgba(245, 158, 11, 0.35)',
    },
    preview: {
      bg: '#090806',
      surface: '#12100b',
      border: '#78350f',
      accent: '#f59e0b',
      text: '#fefce8',
    },
  },
  {
    id: 'matrix-emerald',
    name: 'Bio Emerald',
    shortName: 'Emerald',
    description: 'Midnight stealth obsidian chassis with vibrant kinetic emerald accents.',
    isDark: true,
    palette: {
      bgApp: '#040806',
      bgSurface: '#09130d',
      bgSurfaceSubtle: '#101e16',
      bgSurfaceElevated: '#172c20',
      borderSubtle: '#173023',
      borderStrong: '#254d38',
      textMain: '#f0fdf4',
      textSecondary: '#86efac',
      textMuted: '#4ade80',
      accent: '#10b981',
      accentText: '#040806',
      accentHover: '#059669',
      accentSubtle: 'rgba(16, 185, 129, 0.16)',
      accentRing: 'rgba(16, 185, 129, 0.35)',
    },
    preview: {
      bg: '#040806',
      surface: '#09130d',
      border: '#064e3b',
      accent: '#10b981',
      text: '#f0fdf4',
    },
  },
  {
    id: 'minimal-cream',
    name: 'Warm Studio Paper',
    shortName: 'Warm Light',
    description: 'Off-white architectural canvas with deep espresso typography and natural warmth.',
    isDark: false,
    palette: {
      bgApp: '#f9f8f6',
      bgSurface: '#ffffff',
      bgSurfaceSubtle: '#f2efe9',
      bgSurfaceElevated: '#ffffff',
      borderSubtle: '#e6e2da',
      borderStrong: '#d4cebf',
      textMain: '#1c1917',
      textSecondary: '#57534e',
      textMuted: '#78716c',
      accent: '#1c1917',
      accentText: '#ffffff',
      accentHover: '#292524',
      accentSubtle: 'rgba(28, 25, 23, 0.08)',
      accentRing: 'rgba(28, 25, 23, 0.25)',
    },
    preview: {
      bg: '#f9f8f6',
      surface: '#ffffff',
      border: '#e6e2da',
      accent: '#1c1917',
      text: '#1c1917',
    },
  },
];

export const DEFAULT_THEME_ID = 'mono-oled';

export function getThemeById(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyThemeToDocument(theme: ThemeDefinition): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Toggle dark class
  if (theme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set data-theme attribute
  root.setAttribute('data-theme', theme.id);

  // Set CSS Variables
  const { palette } = theme;
  root.style.setProperty('--bg-app', palette.bgApp);
  root.style.setProperty('--bg-surface', palette.bgSurface);
  root.style.setProperty('--bg-surface-subtle', palette.bgSurfaceSubtle);
  root.style.setProperty('--bg-surface-elevated', palette.bgSurfaceElevated);
  root.style.setProperty('--border-subtle', palette.borderSubtle);
  root.style.setProperty('--border-strong', palette.borderStrong);
  root.style.setProperty('--text-main', palette.textMain);
  root.style.setProperty('--text-secondary', palette.textSecondary);
  root.style.setProperty('--text-muted', palette.textMuted);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-text', palette.accentText);
  root.style.setProperty('--accent-hover', palette.accentHover);
  root.style.setProperty('--accent-subtle', palette.accentSubtle);
  root.style.setProperty('--accent-ring', palette.accentRing);

  // Update theme-color meta tag for mobile browsers / PWA
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', palette.bgApp);
  }
}
