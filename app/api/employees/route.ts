import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - All employees
export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data: employees, error } = await db
      .from('employees')
      .select('id, name, employee_id, email, department, phone, is_active, created_at')
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ employees })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Add new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, employee_id, email, department, phone } = body

    if (!name || !employee_id || !email) {
      return NextResponse.json(
        { error: 'Name, Employee ID aur Email required hain' },
        { status: 400 }
      )
    }

    const db = supabaseAdmin()
    const { data: employee, error } = await db
      .from('employees')
      .insert({ name, employee_id: employee_id.toUpperCase(), email, department, phone })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Employee ID ya Email pehle se exist karta hai' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ employee, message: 'Employee add ho gaya!' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Toggle active/inactive
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_active } = body

    const db = supabaseAdmin()
    const { data, error } = await db
      .from('employees')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ employee: data })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Employee delete karo
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Employee ID required hai' }, { status: 400 })
    }

    const db = supabaseAdmin()

    // Pehle attendance records delete karo (foreign key constraint)
    await db.from('attendance').delete().eq('employee_id', id)

    // Phir employee delete karo
    const { error } = await db.from('employees').delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: 'Employee delete ho gaya!' })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
