import { NextRequest, NextResponse } from 'next/server'
import { verifyQRToken } from '@/lib/qr-utils'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employee_id, token, device_info } = body

    // 1. Token validate karo
    if (!token || !verifyQRToken(token)) {
      return NextResponse.json(
        { error: 'QR code expire ho gaya ya invalid hai' },
        { status: 401 }
      )
    }

    // 2. Employee exist karta hai?
    const db = supabaseAdmin()
    const { data: employee, error: empError } = await db
      .from('employees')
      .select('id, name, employee_id, is_active')
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      return NextResponse.json({ error: 'Employee nahi mila' }, { status: 404 })
    }

    if (!employee.is_active) {
      return NextResponse.json({ error: 'Employee inactive hai' }, { status: 403 })
    }

    const today = new Date().toISOString().split('T')[0]
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = new Date().toISOString()

    // 3. Aaj ka record check karo
    const { data: existing } = await db
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('date', today)
      .single()

    if (!existing) {
      // First scan = CHECK IN
      const { data: newRecord, error: insertError } = await db
        .from('attendance')
        .insert({
          employee_id,
          date: today,
          check_in: now,
          status: 'present',
          ip_address: ip,
          device_info: device_info?.slice(0, 200) || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        action: 'check_in',
        check_in: newRecord.check_in,
        employee_name: employee.name,
        message: `${employee.name} ka check-in ho gaya!`,
      })
    }

    // Second scan = CHECK OUT (agar check_out nahi hua)
    if (existing.check_in && !existing.check_out) {
      const { data: updated, error: updateError } = await db
        .from('attendance')
        .update({ check_out: now })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: 'Update error' }, { status: 500 })
      }

      // Total hours calculate karo
      const checkInTime = new Date(existing.check_in)
      const checkOutTime = new Date(now)
      const hours = ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(1)

      return NextResponse.json({
        success: true,
        action: 'check_out',
        check_in: existing.check_in,
        check_out: updated.check_out,
        total_hours: hours,
        employee_name: employee.name,
        message: `${employee.name} ka check-out ho gaya! Total: ${hours} hours`,
      })
    }

    // Dono ho chuke hain
    return NextResponse.json(
      { error: 'Aaj ki attendance pehle se complete ho chuki hai (check-in + check-out)' },
      { status: 409 }
    )

  } catch (error) {
    console.error('Mark attendance error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
