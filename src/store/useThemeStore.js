import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const THEMES = {
  daylight: {
    name: 'Daylight',
    isDark: false,
    bg: '#E9E7E2',       // cement / crease dust
    surface: '#F4F3EF',  // chalk panel
    card: '#FCFBF9',     // fresh scorebook page
    border: '#CFCBC2',   // decorative rules only (1.31:1)
    input: '#7E776A',    // interactive outlines (3.59:1 on bg)
    accent: '#4F6B04',   // taped-ball olive
    accentDim: '#3A4F03',
    onAccent: '#FCFBF9',
    text: '#16181D',     // ink
    muted: '#5C5F66',    // pencil
    red: '#A32B1F',      // leather ball
    yellow: '#DDF247',   // optic highlight — FILL ONLY, never text
    blue: '#1D4E89',
  },
  midnight: {
    name: 'Midnight',
    isDark: true,
    bg: '#0B0F0C',
    surface: '#111827',
    card: '#1a2233',
    border: '#1F2937',
    input: '#4F6078',
    accent: '#00FF9C',
    accentDim: '#00cc7d',
    onAccent: '#0B0F0C',
    text: '#D1D5DB',
    muted: '#8A94A1',   // was #6B7280 — failed AA (3.99 bg / 3.29 card)
    red: '#F87171',
    yellow: '#FBBF24',
    blue: '#60A5FA',
  },
  ocean: {
    name: 'Ocean Blue',
    isDark: true,
    bg: '#0a1628',
    surface: '#0f1f3d',
    card: '#162a4a',
    border: '#1e3a5f',
    input: '#32659F',
    accent: '#38BDF8',
    accentDim: '#0ea5e9',
    onAccent: '#0a1628',
    text: '#e2e8f0',
    muted: '#8A9AB0',   // was #64748b — failed AA (3.81 bg / 3.01 card)
    red: '#fb7185',
    yellow: '#fde047',
    blue: '#38BDF8',
  },
  crimson: {
    name: 'Crimson',
    isDark: true,
    bg: '#110a0a',
    surface: '#1a1111',
    card: '#261818',
    border: '#3b2020',
    input: '#904C4C',
    accent: '#FF6B6B',
    accentDim: '#e05555',
    onAccent: '#110a0a',
    text: '#e8d5d5',
    muted: '#A07B7B',   // was #8b6464 — failed AA (3.83 bg / 3.35 card)
    red: '#FF6B6B',
    yellow: '#fbbf24',
    blue: '#93c5fd',
  },
  emerald: {
    name: 'Emerald',
    isDark: true,
    bg: '#071210',
    surface: '#0d1f1b',
    card: '#142d27',
    border: '#1f4038',
    input: '#2F6A5C',
    accent: '#34D399',
    accentDim: '#10b981',
    onAccent: '#071210',
    text: '#d1e7e0',
    muted: '#7BA398',   // was #5f8a7e — failed AA (4.92 bg / 3.78 card)
    red: '#f87171',
    yellow: '#fde68a',
    blue: '#67e8f9',
  },
  amber: {
    name: 'Amber Gold',
    isDark: true,
    bg: '#12100a',
    surface: '#1c1810',
    card: '#2a2418',
    border: '#3d3520',
    input: '#6E603A',
    accent: '#F59E0B',
    accentDim: '#d97706',
    onAccent: '#12100a',
    text: '#e8e0d0',
    muted: '#A3977B',   // was #8b7f64 — failed AA (4.82 bg / 3.90 card)
    red: '#f87171',
    yellow: '#F59E0B',
    blue: '#93c5fd',
  },
}

const useThemeStore = create(
  persist(
    (set) => ({
      currentTheme: 'daylight',
      setTheme: (themeKey) => set({ currentTheme: themeKey }),
    }),
    { name: 'crichub-theme' }
  )
)

/** Get active theme object */
export const useTheme = () => {
  const key = useThemeStore((s) => s.currentTheme)
  return THEMES[key] || THEMES.daylight
}

/**
 * Maps CSS custom property name -> theme token key.
 *
 * These are shadcn/ui's canonical names, deliberately. Two of them mean
 * something different to shadcn than they do to this app, so read before editing:
 *
 *   --accent  shadcn: a subtle hover BACKGROUND.  app `accent`: the bright brand
 *             colour. Wiring `accent -> --accent` tints every hover state neon,
 *             so the brand colour goes to --primary/--ring instead.
 *   --muted   shadcn: a BACKGROUND.  app `muted`: secondary TEXT.
 *             So `muted -> --muted-foreground`, and --muted gets `surface`.
 *
 * Everything is projected under one set of names — no duplicate writes, and
 * index.css's existing var(--border) / var(--card) now resolve globally instead
 * of only on elements that happen to set them inline.
 */
const CSS_VARS = {
  background: 'bg',
  foreground: 'text',
  card: 'card',
  'card-foreground': 'text',
  popover: 'card',
  'popover-foreground': 'text',
  primary: 'accent',
  'primary-foreground': 'onAccent',
  secondary: 'surface',
  'secondary-foreground': 'text',
  muted: 'surface',
  'muted-foreground': 'muted',
  accent: 'surface',
  'accent-foreground': 'text',
  destructive: 'red',
  border: 'border',
  input: 'input',
  ring: 'accent',
  // CricHub-specific tokens shadcn has no name for
  surface: 'surface',
  'accent-dim': 'accentDim',
  warn: 'yellow',
  info: 'blue',
}

/**
 * Projects the active theme onto :root so CSS and Tailwind utilities can reach
 * it. Additive: useTheme() still returns the same object, so existing inline
 * styles are unaffected. Call once, from the app shell.
 */
export function useThemeEffect() {
  const key = useThemeStore((s) => s.currentTheme)

  useEffect(() => {
    const t = THEMES[key] || THEMES.daylight
    const root = document.documentElement

    for (const [cssVar, token] of Object.entries(CSS_VARS)) {
      if (t[token]) root.style.setProperty(`--${cssVar}`, t[token])
    }

    root.dataset.theme = key
    root.classList.toggle('dark', !!t.isDark)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', t.bg)
  }, [key])
}

export default useThemeStore
