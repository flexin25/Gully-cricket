import { useTheme } from '../store/useThemeStore'


export default function Footer() {
  const t = useTheme()
  return (
    <footer
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: t.surface + 'e6',
        borderTop: `1px solid ${t.border}`,
        backdropFilter: 'blur(12px)',
        padding: '12px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        fontSize: '11px', color: t.muted,
        fontFamily: 'inherit',
      }}
    >

      <div>
        <span>© 2026 <span style={{ color: t.accent, fontWeight: 600 }}>CricHub.in</span></span>
        <span style={{ margin: '0 8px', color: t.border }}>|</span>
        <span>Made with love for SCR - Siliguri Chhad Riders🏏</span>
      </div>
    </footer>
  )
}
