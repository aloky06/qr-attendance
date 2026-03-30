import crypto from 'crypto'

/**
 * Har minute ke liye unique QR token generate karta hai
 * Token = HMAC(secret, "YYYY-MM-DD HH:MM") format
 * Isse har minute token automatically change hota hai
 */
export function generateQRToken(date?: Date): string {
  const now = date || new Date()
  
  // Current minute tak round karo (seconds ignore)
  const minuteSlot = new Date(now)
  minuteSlot.setSeconds(0, 0)
  
  // Format: "2024-01-15 09:30" - har minute unique
  const timeString = minuteSlot.toISOString().slice(0, 16).replace('T', ' ')
  
  const secret = process.env.ADMIN_SECRET || 'default-secret-change-this'
  
  // HMAC-SHA256 se secure token banao
  const token = crypto
    .createHmac('sha256', secret)
    .update(timeString)
    .digest('hex')
    .slice(0, 32) // 32 char token
  
  return token
}

/**
 * Token verify karo - current minute ya previous minute ka valid hai
 * (2 minute window for network delay)
 */
export function verifyQRToken(token: string): boolean {
  const now = new Date()
  
  // Current minute check
  if (token === generateQRToken(now)) return true
  
  // Previous minute check (grace period)
  const prevMinute = new Date(now.getTime() - 60 * 1000)
  if (token === generateQRToken(prevMinute)) return true
  
  return false
}

/**
 * Next token change me kitne seconds bache hain
 */
export function getSecondsUntilNextToken(): number {
  const now = new Date()
  return 60 - now.getSeconds()
}

/**
 * QR me encode karne ka full payload
 */
export function generateQRPayload(appUrl: string): string {
  const token = generateQRToken()
  const timestamp = Date.now()
  // Attendance mark karne ka URL
  return `${appUrl}/attendance?token=${token}&t=${timestamp}`
}
