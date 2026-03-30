'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Employee { id: string; name: string; employee_id: string; department: string }

function AttendancePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already_marked'>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<{ action?: string; time?: string; name?: string } | null>(null)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/employees')
      .then(r => r.json())
      .then(d => d.employees && setEmployees(d.employees))
  }, [])

  useEffect(() => {
    if (!token) { setTokenValid(false); return }
    fetch(`/api/generate-qr?verify=${token}`)
      .then(r => r.json())
      .then(d => setTokenValid(d.valid))
  }, [token])

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const markAttendance = useCallback(async () => {
    if (!selectedEmployee || !token) return
    setStatus('loading')

    const res = await fetch('/api/mark-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: selectedEmployee.id,
        token,
        device_info: navigator.userAgent,
      })
    })

    const data = await res.json()

    if (res.ok) {
      if (data.action === 'check_in') {
        setStatus('success')
        setMessage(`✅ Check-in successful!`)
        setResult({ action: 'check_in', time: data.check_in, name: selectedEmployee.name })
      } else if (data.action === 'check_out') {
        setStatus('success')
        setMessage(`✅ Check-out successful!`)
        setResult({ action: 'check_out', time: data.check_out, name: selectedEmployee.name })
      }
    } else if (res.status === 409) {
      setStatus('already_marked')
      setMessage('ℹ️ Aapki attendance aaj ke liye pehle se lag chuki hai')
    } else if (res.status === 401) {
      setStatus('error')
      setMessage('❌ QR code expire ho gaya! Nayi QR scan karein.')
    } else {
      setStatus('error')
      setMessage('❌ Error: ' + (data.error || 'Kuch gadbad ho gayi'))
    }
  }, [selectedEmployee, token])

  if (tokenValid === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏱️</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#ff6584', marginBottom: '1rem' }}>QR Expire Ho Gaya</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Yeh QR code expire ho chuka hai. Admin screen se naya QR scan karein.</p>
          <Link href="/" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: 'var(--accent)', borderRadius: 10, color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Home par Jao</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: 20, padding: '0.4rem 1rem', marginBottom: '1rem' }}>
            <span style={{ width: 8, height: 8, background: 'var(--accent3)', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ color: 'var(--accent3)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>QR Verified</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Attendance Mark Karo</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {status === 'success' || status === 'already_marked' ? (
          <div style={{ background: 'var(--surface)', border: `1px solid ${status === 'success' ? 'rgba(67,233,123,0.3)' : 'rgba(108,99,255,0.3)'}`, borderRadius: 20, padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {result?.action === 'check_in' ? '🟢' : result?.action === 'check_out' ? '🔴' : 'ℹ️'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: status === 'success' ? 'var(--accent3)' : 'var(--accent)', marginBottom: '0.5rem' }}>
              {result?.action === 'check_in' ? 'Check-in Ho Gaya!' : result?.action === 'check_out' ? 'Check-out Ho Gaya!' : 'Pehle Se Marked'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{message}</p>
            {result && (
              <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>{result.name}</div>
                <div style={{ color: 'var(--accent3)', fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem' }}>
                  {result.time ? new Date(result.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                </div>
              </div>
            )}
            <button onClick={() => { setStatus('idle'); setSelectedEmployee(null); setSearchQuery(''); setResult(null) }}
              style={{ padding: '0.75rem 2rem', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer' }}>
              Dobara Mark Karo
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem' }}>
            {status === 'error' && (
              <div style={{ background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.25rem', color: '#ff6584', fontSize: '0.875rem' }}>
                {message}
              </div>
            )}

            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Apna naam khojo</label>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Naam ya Employee ID type karo..."
              style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', outline: 'none', marginBottom: '0.875rem' }}
            />

            {/* Employee list */}
            {searchQuery && (
              <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredEmployees.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>Koi employee nahi mila</p>
                ) : filteredEmployees.map(emp => (
                  <button key={emp.id} onClick={() => { setSelectedEmployee(emp); setSearchQuery('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: selectedEmployee?.id === emp.id ? 'rgba(108,99,255,0.2)' : 'var(--surface2)', border: `1px solid ${selectedEmployee?.id === emp.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>{emp.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{emp.department} • {emp.employee_id}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected employee */}
            {selectedEmployee && (
              <div style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: 600 }}>{selectedEmployee.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selectedEmployee.employee_id}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedEmployee(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
              </div>
            )}

            <button
              onClick={markAttendance}
              disabled={!selectedEmployee || status === 'loading'}
              style={{ width: '100%', padding: '1rem', background: selectedEmployee ? 'linear-gradient(135deg, var(--accent), #8b5cf6)' : 'var(--surface2)', border: 'none', borderRadius: 12, color: selectedEmployee ? '#fff' : 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', cursor: selectedEmployee ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }}>
              {status === 'loading' ? '⌛ Processing...' : '✓ Attendance Lagao'}
            </button>

            <Link href="/" style={{ display: 'block', textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Wapas Home</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AttendancePageWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' }}>Loading...</div>}>
      <AttendancePage />
    </Suspense>
  )
}
