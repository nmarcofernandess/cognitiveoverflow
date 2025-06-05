import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDM3NTU2MzgsImV4cCI6MTk1OTMzMTYzOH0.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para verificar se Supabase está configurado
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
}

// Types para os recursos
export interface Resource {
  id: string
  title: string
  content: string
  category: 'recursos' | 'insights' | 'docs'
  tags: string[]
  priority: 'alta' | 'média' | 'baixa'
  created_at: string
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      recursos: {
        Row: Resource
        Insert: Omit<Resource, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Resource, 'id' | 'created_at'>>
      }
    }
  }
} 