import { NextRequest, NextResponse } from 'next/server'
import { generateQRPayload, generateQRToken, verifyQRToken, getSecondsUntilNextToken } from '@/lib/qr-utils'

export async function GET(request: NextRequest) {
  // Token verify karne ke liye
  const verify = request.nextUrl.searchParams.get('verify')
  if (verify) {
    const valid = verifyQRToken(verify)
    return NextResponse.json({ valid })
  }

  // Naya QR payload generate karo
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`
  const payload = generateQRPayload(appUrl)
  const currentToken = generateQRToken()
  const secondsLeft = getSecondsUntilNextToken()

  return NextResponse.json({
    payload,
    token: currentToken,
    secondsUntilRefresh: secondsLeft,
    generatedAt: new Date().toISOString(),
  })
}
