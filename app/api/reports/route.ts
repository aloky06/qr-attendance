import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0]
    const month = request.nextUrl.searchParams.get('month') // YYYY-MM format
    
    const db = supabaseAdmin()

    let query = db
      .from('attendance')
      .select(`
        id, date, check_in, check_out, status, ip_address, notes,
        employees (id, name, employee_id, department, email)
      `)
      .order('check_in', { ascending: false })

    if (month) {
      // Monthly report
      query = query
        .gte('date', `${month}-01`)
        .lte('date', `${month}-31`)
    } else {
      // Daily report
      query = query.eq('date', date)
    }

    const { data: records, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Summary stats
    const totalEmployees = await db.from('employees').select('id', { count: 'exact' }).eq('is_active', true)
    
    const summary = {
      date,
      total_employees: totalEmployees.count || 0,
      present: records?.length || 0,
      absent: Math.max(0, (totalEmployees.count || 0) - (records?.length || 0)),
      checked_out: records?.filter(r => r.check_out).length || 0,
    }

    return NextResponse.json({ records, summary })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
