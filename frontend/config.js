import { createClient } from '@supabase/supabase-js';

// In a real Vite project, use import.meta.env.VITE_SUPABASE_URL
// For now, we fall back to your hardcoded config for immediate functionality
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gghpbvuwuloeqcfftnpk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaHBidnV3dWxvZXFjZmZ0bnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDcxNTUsImV4cCI6MjA4MDcyMzE1NX0.fbWXj7x1uSXLxM750zUUVunV0hUUB40rlQWT6gRMbOM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);