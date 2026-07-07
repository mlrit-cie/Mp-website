import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * True only when a real Supabase project is configured. When it's not (env vars
 * missing/commented out), we must NOT let requests fly at a dead placeholder
 * host — those hang until a network timeout and freeze every page with an
 * endless spinner.
 */
export const isSupabaseConfigured = Boolean(
  rawUrl && rawKey && !rawUrl.includes('placeholder')
)

const supabaseUrl = rawUrl || 'https://placeholder.supabase.co'
const supabaseAnonKey = rawKey || 'placeholder-key'

/**
 * Guarded fetch:
 * - Not configured → resolve INSTANTLY with an empty result, so data hooks show
 *   an empty state immediately instead of hanging (this is what makes the pages
 *   fast again while there's no backend).
 * - Configured → real fetch, but with an 8s timeout as a safety net so a slow/
 *   paused backend can never freeze the UI indefinitely.
 */
const guardedFetch: typeof fetch = async (input, init) => {
  if (!isSupabaseConfigured) {
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    return await fetch(input as RequestInfo, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: guardedFetch },
})

// Database types (you can generate these with Supabase CLI)
export interface User {
  id: number
  auth_id?: string | null
  name: string
  email: string
  role: 'admin' | 'faculty' | 'student_mentor' | 'student'
  approved?: boolean
  section_id?: number
  department?: string | null
  roll_number?: string | null
  phone?: string | null
  github_link?: string | null
  linkedin_link?: string | null
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
  description?: string | null
  status: 'Draft' | 'Student Mentor Review' | 'Faculty Review' | 'Approved' | 'Submitted to CIE' | 'Completed'
  team_id?: number
  mentor_id?: number
  section_id?: number | null
  domain?: string | null
  abstract?: string | null
  github_link?: string | null
  video_link?: string | null
  ppt_file?: string | null
  report_file?: string | null
  yukthi_file?: string | null
  feedback?: string | null
  deadline?: string | null
  academic_year?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProjectStatusHistoryEntry {
  id: number
  project_id: number
  from_status: Project['status'] | null
  to_status: Project['status']
  changed_by?: number | null
  changed_at: string
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

export interface Timetable {
  id: number
  section_id: number
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  start_time: string
  end_time: string
  subject: string
  room_number: string
  faculty_id?: number | null
  student_mentor_ids: number[]
  created_at?: string
  updated_at?: string
}