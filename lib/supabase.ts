import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for Neural System
export interface Person {
  id: string
  name: string
  relation: string
  tldr?: string
  created_at: string
  updated_at?: string
}

export interface PersonNote {
  id: string
  person_id: string
  title: string
  content?: string
  tags: string[]
  created_at: string
}

export interface Project {
  id: string
  name: string
  tldr?: string
  created_at: string
  updated_at?: string
}

export interface Sprint {
  id: string
  project_id: string
  name: string
  tldr?: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at?: string
}

export interface Task {
  id: string
  sprint_id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: number
  created_at: string
  completed_at?: string
}

export interface SprintNote {
  id: string
  sprint_id: string
  title: string
  content?: string
  tags: string[]
  created_at: string
} 