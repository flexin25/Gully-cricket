import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const THEMES = {
  midnight: {
    name: 'Midnight',
    bg: '#0B0F0C',
    surface: '#111827',
    card: '#1a2233',
    border: '#1F2937',
    accent: '#00FF9C',
    accentDim: '#00cc7d',
    text: '#D1D5DB',
    muted: '#6B7280',
    red: '#F87171',
    yellow: '#FBBF24',
    blue: '#60A5FA',
  },
  ocean: {
    name: 'Ocean Blue',
    bg: '#0a1628',
    surface: '#0f1f3d',
    card: '#162a4a',
    border: '#1e3a5f',
    accent: '#38BDF8',
    accentDim: '#0ea5e9',
    text: '#e2e8f0',
    muted: '#64748b',
    red: '#fb7185',
    yellow: '#fde047',
    blue: '#38BDF8',
  },
  crimson: {
    name: 'Crimson',
    bg: '#110a0a',
    surface: '#1a1111',
    card: '#261818',
    border: '#3b2020',
    accent: '#FF6B6B',
    accentDim: '#e05555',
    text: '#e8d5d5',
    muted: '#8b6464',
    red: '#FF6B6B',
    yellow: '#fbbf24',
    blue: '#93c5fd',
  },
  emerald: {
    name: 'Emerald',
    bg: '#071210',
    surface: '#0d1f1b',
    card: '#142d27',
    border: '#1f4038',
    accent: '#34D399',
    accentDim: '#10b981',
    text: '#d1e7e0',
    muted: '#5f8a7e',
    red: '#f87171',
    yellow: '#fde68a',
    blue: '#67e8f9',
  },
  amber: {
    name: 'Amber Gold',
    bg: '#12100a',
    surface: '#1c1810',
    card: '#2a2418',
    border: '#3d3520',
    accent: '#F59E0B',
    accentDim: '#d97706',
    text: '#e8e0d0',
    muted: '#8b7f64',
    red: '#f87171',
    yellow: '#F59E0B',
    blue: '#93c5fd',
  },
}

const useThemeStore = create(
  persist(
    (set) => ({
      currentTheme: 'midnight',
      setTheme: (themeKey) => set({ currentTheme: themeKey }),
    }),
    { name: 'crichub-theme' }
  )
)

/** Get active theme object */
export const useTheme = () => {
  const key = useThemeStore((s) => s.currentTheme)
  return THEMES[key] || THEMES.midnight
}

export default useThemeStore
