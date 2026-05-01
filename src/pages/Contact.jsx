import { useState } from 'react'
import { useTheme } from '../store/useThemeStore'
import Footer from '../components/Footer'

export default function Contact() {
  const t = useTheme()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const inp = { background: t.bg, border: `1px solid ${t.border}`, borderRadius: 4, color: t.text, fontFamily: 'inherit', fontSize: 13, padding: '10px 12px', width: '100%', outline: 'none' }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Static form — backend integration later
    setSubmitted(true)
  }

  return (
    <div className="page-anim" style={{ background: t.bg, color: t.text, minHeight: '100vh', paddingTop: 60, paddingBottom: 60 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: t.accent, marginBottom: 8 }}>Contact</h1>

        {/* Developer info */}
        <div style={{ border: `1px solid ${t.border}`, borderRadius: 6, padding: 14, background: t.card, marginBottom: 24 }}>
          <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>▸ DEVELOPER</div>
          <div style={{ color: t.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Abhishek Bardhan</div>
          <p style={{ color: t.muted, fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            Hi, I'm a Rookie developer who likes to build useless stuffs and loves Diet Coke & Linkin Park. The intention to make this was solely
            for our wonderful team Siliguri Chhad Riders. Show some support pleawwse &lt; 3 ❤️
          </p>
          {/* <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11 }}>
            <span style={{ color: t.muted }}>📧 bardhanabhishek50@gmail.com</span>
            <span style={{ color: t.muted }}>🌐 crichub.in</span>
          </div> */}
        </div>

        {/* Contact form */}
        <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>▸ SEND A MESSAGE</div>
        {submitted ? (
          <div style={{ border: `1px solid ${t.accent}33`, borderRadius: 6, padding: 16, background: t.accent + '0a', textAlign: 'center' }}>
            <div style={{ color: t.accent, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>✓ Message received!</div>
            <div style={{ color: t.muted, fontSize: 12 }}>We'll get back to you soon. Thanks for reaching out.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input style={inp} placeholder="Your name" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={inp} type="email" placeholder="Your email" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} placeholder="Your message..."
              required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            <button type="submit" className="btn-t"
              style={{ background: 'none', border: `1px solid ${t.accent}`, borderRadius: 4, color: t.accent, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Send Message →
            </button>
          </form>
        )}

        {/* Social Links */}
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 24 }}>
          <a href="#" style={{ color: t.muted, transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="GitHub" onMouseEnter={e => e.currentTarget.style.color = t.text} onMouseLeave={e => e.currentTarget.style.color = t.muted}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="#" style={{ color: t.muted, transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Twitter / X" onMouseEnter={e => e.currentTarget.style.color = t.text} onMouseLeave={e => e.currentTarget.style.color = t.muted}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="#" style={{ color: t.muted, transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Instagram" onMouseEnter={e => e.currentTarget.style.color = t.text} onMouseLeave={e => e.currentTarget.style.color = t.muted}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
        </div>


      </div>
      <Footer />
    </div>
  )
}
