// lib/supabase.js
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// This creates a single instance of the Supabase client that shares the session 
// state and properly respects user Row Level Security (RLS) on the client side.
export const supabase = createClientComponentClient()