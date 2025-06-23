import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Validate env vars but don't break build - just log loudly
if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = `🚨 MISSING SUPABASE ENV VARS: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`;
    console.error(errorMsg);
    
    // Only throw in production runtime (not build time)
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && process.env.VERCEL) {
        console.error('🔥 Production deployment needs these vars!');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 