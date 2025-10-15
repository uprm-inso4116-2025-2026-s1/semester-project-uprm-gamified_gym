import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://switjvezhwonckihgokh.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aXRqdmV6aHdvbmNraWhnb2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzA4MzMsImV4cCI6MjA3MzcwNjgzM30.jHu9KvbZB8uVx8QJyLC2-I57bSylczqeV_Gi-Pdt1Es'

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)