'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(67,233,123,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 700 }}>
        {/* Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            ◈
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            ATTENDIFY
          </span>
        </div>

        {/* Live clock */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1, marginBottom: '0.5rem' }}>
          {time}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '3rem', letterSpacing: '0.05em' }}>
          {date}
        </div>

        {/* Heading */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, var(--text) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          QR-Based Attendance System
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '3rem', lineHeight: 1.6 }}>
          Har minute automatically change hone wala QR code. Sirf scan karo, attendance lagao.
        </p>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/attendance" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.05))',
              border: '1px solid rgba(108,99,255,0.4)',
              borderRadius: 16,
              padding: '2rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
                Mark Attendance
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Employee login karke QR scan karein
              </div>
            </div>
          </Link>

          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(67,233,123,0.15), rgba(67,233,123,0.03))',
              border: '1px solid rgba(67,233,123,0.3)',
              borderRadius: 16,
              padding: '2rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🖥️</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
                Admin Dashboard
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                QR display + reports + employees
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          {['⚡ Har minute naya QR', '🔒 HMAC Secured', '📊 Daily Reports', '👥 Multi-Employee'].map(f => (
            <span key={f} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '0.4rem 0.9rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
