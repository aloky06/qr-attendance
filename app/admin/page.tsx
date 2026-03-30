'use client'
import { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'

interface Employee { id: string; name: string; employee_id: string; email: string; department: string; is_active: boolean }
interface AttendanceRecord { id: string; employee_id: string; date: string; check_in: string; check_out: string; status: string; employees: { name: string; employee_id: string; department: string } }

export default function AdminPage() {
  const [qrPayload, setQrPayload] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [tab, setTab] = useState<'qr' | 'attendance' | 'employees'>('qr')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [newEmp, setNewEmp] = useState({ name: '', employee_id: '', email: '', department: '', phone: '' })
  const [addingEmp, setAddingEmp] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refreshQR = useCallback(async () => {
    try {
      const res = await fetch('/api/generate-qr')
      const data = await res.json()
      if (data.payload) setQrPayload(data.payload)
    } catch (e) { console.error(e) }
  }, [])

  const fetchAttendance = useCallback(async () => {
    const res = await fetch(`/api/reports?date=${selectedDate}`)
    const data = await res.json()
    if (data.records) setAttendance(data.records)
  }, [selectedDate])

  const fetchEmployees = useCallback(async () => {
    const res = await fetch('/api/employees')
    const data = await res.json()
    if (data.employees) setEmployees(data.employees)
  }, [])

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    refreshQR()
    fetchEmployees()
    fetchAttendance()
    const tick = () => {
      const now = new Date()
      const secondsLeft = 60 - now.getSeconds()
      setTimeLeft(secondsLeft)
      if (secondsLeft === 60 || secondsLeft === 59) refreshQR()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isAuthenticated, refreshQR, fetchEmployees, fetchAttendance])

  useEffect(() => {
    if (isAuthenticated) fetchAttendance()
  }, [selectedDate, isAuthenticated, fetchAttendance])

  const handleLogin = () => {
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
    if (password === adminPass || password === 'admin123') {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_auth', 'true')
      setAuthError('')
    } else {
      setAuthError('Galat password! Default: admin123')
    }
  }

  const handleAddEmployee = async () => {
    if (!newEmp.name || !newEmp.employee_id || !newEmp.email) {
      setMessage('❌ Name, ID aur Email required hai')
      return
    }
    setAddingEmp(true)
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp)
    })
    const data = await res.json()
    if (data.employee) {
      setMessage('✅ Employee add ho gaya!')
      setNewEmp({ name: '', employee_id: '', email: '', department: '', phone: '' })
      fetchEmployees()
    } else {
      setMessage('❌ Error: ' + (data.error || 'Unknown error'))
    }
    setAddingEmp(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleToggleActive = async (emp: Employee) => {
    await fetch('/api/employees', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: emp.id, is_active: !emp.is_active })
    })
    fetchEmployees()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const res = await fetch('/api/employees', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const data = await res.json()
    if (res.ok) {
      setMessage('✅ Employee delete ho gaya!')
      fetchEmployees()
    } else {
      setMessage('❌ Error: ' + (data.error || 'Unknown error'))
    }
    setDeletingId(null)
    setDeleteConfirm(null)
    setTimeout(() => setMessage(''), 3000)
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '3rem', width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text)' }}>Admin Login</h2>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '1rem', marginBottom: '1rem', outline: 'none' }}
          />
          {authError && <p style={{ color: '#ff6584', fontSize: '0.875rem', marginBottom: '1rem' }}>{authError}</p>}
          <button onClick={handleLogin} style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
            Login
          </button>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>Default password: admin123</p>
          <Link href="/" style={{ display: 'block', marginTop: '1rem', color: 'var(--accent)', fontSize: '0.875rem', textDecoration: 'none' }}>← Home par wapas jao</Link>
        </div>
      </div>
    )
  }

  const progressPct = ((60 - timeLeft) / 60) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1.5rem' }}>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,101,132,0.4)', borderRadius: 16, padding: '2rem', maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
              Employee Delete Karo?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              <strong style={{ color: '#ff6584' }}>
                {employees.find(e => e.id === deleteConfirm)?.name}
              </strong> ko delete karne se unki saari attendance records bhi permanently hata jaayengi.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deletingId === deleteConfirm}
                style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,101,132,0.2)', border: '1px solid rgba(255,101,132,0.5)', borderRadius: 10, color: '#ff6584', fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer' }}>
                {deletingId === deleteConfirm ? 'Deleting...' : '🗑 Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text)' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>QR Attendance Management System</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/" style={{ padding: '0.6rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', textDecoration: 'none' }}>← Home</Link>
            <button onClick={() => { sessionStorage.removeItem('admin_auth'); setIsAuthenticated(false) }} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,101,132,0.15)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 8, color: '#ff6584', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.375rem', width: 'fit-content' }}>
          {([['qr', '📱 QR Display'], ['attendance', '📋 Attendance'], ['employees', '👥 Employees']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '0.6rem 1.25rem', background: tab === id ? 'var(--accent)' : 'transparent', border: 'none', borderRadius: 8, color: tab === id ? '#fff' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* QR Tab */}
        {tab === 'qr' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', textAlign: 'center', minWidth: 320 }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ background: 'rgba(67,233,123,0.15)', color: 'var(--accent3)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  ● LIVE QR CODE
                </span>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 16, display: 'inline-block', marginBottom: '1.5rem' }}>
                {qrPayload ? (
                  <QRCodeSVG value={qrPayload} size={240} level="H" includeMargin={false} />
                ) : (
                  <div style={{ width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Loading...</div>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Next refresh in</span>
                  <span style={{ color: timeLeft <= 10 ? '#ff6584' : 'var(--accent3)', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.9rem' }}>{timeLeft}s</span>
                </div>
                <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${100 - progressPct}%`, background: timeLeft <= 10 ? 'linear-gradient(90deg, #ff6584, #ff9a9e)' : 'linear-gradient(90deg, var(--accent), var(--accent3))', borderRadius: 3, transition: 'width 1s linear' }} />
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Yeh QR code har 60 second mein automatically change hota hai</p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Aaj ki Attendance — {new Date().toLocaleDateString('en-IN')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Present', value: attendance.filter(a => a.status === 'present').length, color: 'var(--accent3)' },
                  { label: 'Total Employees', value: employees.filter(e => e.is_active).length, color: 'var(--accent)' },
                  { label: 'Absent', value: Math.max(0, employees.filter(e => e.is_active).length - attendance.length), color: '#ff6584' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Recent Check-ins</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 300, overflowY: 'auto' }}>
                {attendance.slice(0, 8).map(rec => (
                  <div key={rec.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{rec.employees?.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{rec.employees?.department} • {rec.employees?.employee_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--accent3)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {rec.check_in ? new Date(rec.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Check-in</div>
                    </div>
                  </div>
                ))}
                {attendance.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>Abhi tak koi attendance nahi</p>}
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {tab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)' }}>Attendance Records</h3>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                style={{ padding: '0.5rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }} />
              <button onClick={fetchAttendance} style={{ padding: '0.5rem 1rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', cursor: 'pointer' }}>Refresh</button>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)' }}>
                    {['Employee', 'ID', 'Department', 'Check-in', 'Check-out', 'Status'].map(h => (
                      <th key={h} style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((rec, i) => (
                    <tr key={rec.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500 }}>{rec.employees?.name}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{rec.employees?.employee_id}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{rec.employees?.department}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--accent3)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                        {rec.check_in ? new Date(rec.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                        {rec.check_out ? new Date(rec.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ background: rec.status === 'present' ? 'rgba(67,233,123,0.15)' : 'rgba(255,101,132,0.15)', color: rec.status === 'present' ? 'var(--accent3)' : '#ff6584', border: `1px solid ${rec.status === 'present' ? 'rgba(67,233,123,0.3)' : 'rgba(255,101,132,0.3)'}`, borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Is date ke liye koi record nahi</p>}
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {tab === 'employees' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
                All Employees ({employees.length})
              </h3>
              {message && (
                <div style={{ background: message.startsWith('✅') ? 'rgba(67,233,123,0.1)' : 'rgba(255,101,132,0.1)', border: `1px solid ${message.startsWith('✅') ? 'rgba(67,233,123,0.3)' : 'rgba(255,101,132,0.3)'}`, borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: message.startsWith('✅') ? 'var(--accent3)' : '#ff6584', fontSize: '0.875rem' }}>
                  {message}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {employees.map(emp => (
                  <div key={emp.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Avatar */}
                    <div style={{ width: 40, height: 40, background: emp.is_active ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: emp.is_active ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>
                      {emp.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{emp.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{emp.department || 'No dept'} • {emp.email}</div>
                    </div>

                    {/* ID + Status */}
                    <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>{emp.employee_id}</div>
                      <div style={{ color: emp.is_active ? 'var(--accent3)' : '#ff6584', fontSize: '0.75rem' }}>{emp.is_active ? '● Active' : '○ Inactive'}</div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      {/* Toggle Active/Inactive */}
                      <button
                        onClick={() => handleToggleActive(emp)}
                        title={emp.is_active ? 'Inactive karo' : 'Active karo'}
                        style={{ padding: '0.4rem 0.7rem', background: emp.is_active ? 'rgba(255,101,132,0.1)' : 'rgba(67,233,123,0.1)', border: `1px solid ${emp.is_active ? 'rgba(255,101,132,0.3)' : 'rgba(67,233,123,0.3)'}`, borderRadius: 7, color: emp.is_active ? '#ff6584' : 'var(--accent3)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                        {emp.is_active ? 'Deactivate' : 'Activate'}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteConfirm(emp.id)}
                        title="Delete karo"
                        style={{ padding: '0.4rem 0.7rem', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 7, color: '#ff6584', fontSize: '0.85rem', cursor: 'pointer' }}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
                {employees.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>Koi employee nahi hai</p>
                )}
              </div>
            </div>

            {/* Add Employee Form */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', height: 'fit-content' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>+ New Employee</h4>
              {[
                { key: 'name', label: 'Full Name *', placeholder: 'Rahul Sharma' },
                { key: 'employee_id', label: 'Employee ID *', placeholder: 'EMP006' },
                { key: 'email', label: 'Email *', placeholder: 'rahul@company.com' },
                { key: 'department', label: 'Department', placeholder: 'Engineering' },
                { key: 'phone', label: 'Phone', placeholder: '9876543210' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '0.875rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>{field.label}</label>
                  <input
                    value={(newEmp as any)[field.key]}
                    onChange={e => setNewEmp(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              ))}
              <button onClick={handleAddEmployee} disabled={addingEmp} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', cursor: addingEmp ? 'not-allowed' : 'pointer', opacity: addingEmp ? 0.7 : 1 }}>
                {addingEmp ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
