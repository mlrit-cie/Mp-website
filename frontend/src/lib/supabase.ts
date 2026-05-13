import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these with Supabase CLI)
export interface User {
  id: number
  name: string
  email: string
  password: string
  role: 'admin' | 'faculty' | 'student_mentor' | 'student'
  section_id?: number
  created_at?: string
  updated_at?: string
}

export interface Section {
  id: number
  name: string
  department: string
  year: number
  semester: number
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: number
  title: string
  description: string
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  team_id?: number
  mentor_id?: number
  created_at?: string
  updated_at?: string
}

export interface Team {
  id: number
  name: string
  section_id: number
  created_at?: string
  updated_at?: string
}

export interface Announcement {
  id: number
  title: string
  content: string
  author_id: number
  target_role?: string
  target_section_id?: number
  created_at?: string
  updated_at?: string
}