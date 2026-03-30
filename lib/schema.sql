-- ============================================
-- QR Attendance System - Supabase Schema
-- Supabase SQL Editor me yeh run karein
-- ============================================

-- 1. Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  employee_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "EMP001"
  email VARCHAR(100) UNIQUE NOT NULL,
  department VARCHAR(50),
  phone VARCHAR(15),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attendance records table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'present',  -- present, absent, half_day, late
  ip_address VARCHAR(45),
  device_info TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ek employee ek din me ek hi record
  UNIQUE(employee_id, date)
);

-- 3. Admin users table (simple auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON employees(employee_id);

-- Updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) - Public read for attendance marking
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Employees: anon users sirf read kar sakte hain (QR scan ke liye)
CREATE POLICY "employees_select_policy" ON employees
  FOR SELECT USING (true);

-- Attendance: anon insert kar sakte hain (QR scan), service role sab kuch
CREATE POLICY "attendance_insert_policy" ON attendance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "attendance_select_policy" ON attendance
  FOR SELECT USING (true);

CREATE POLICY "attendance_update_policy" ON attendance
  FOR UPDATE USING (true);

-- Sample employees data
INSERT INTO employees (name, employee_id, email, department, phone) VALUES
  ('Rahul Sharma', 'EMP001', 'rahul@company.com', 'Engineering', '9876543210'),
  ('Priya Singh', 'EMP002', 'priya@company.com', 'Marketing', '9876543211'),
  ('Amit Kumar', 'EMP003', 'amit@company.com', 'Sales', '9876543212'),
  ('Sneha Patel', 'EMP004', 'sneha@company.com', 'HR', '9876543213'),
  ('Vikram Gupta', 'EMP005', 'vikram@company.com', 'Finance', '9876543214')
ON CONFLICT DO NOTHING;
