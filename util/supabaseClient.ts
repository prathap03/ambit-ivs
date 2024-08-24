import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl) {
  console.error('Supabase URL is undefined. Please set NEXT_PUBLIC_SUPABASE_URL in your environment variables.');
}

if (!supabaseKey) {
  console.error('Supabase Key is undefined. Please set NEXT_PUBLIC_SUPABASE_KEY in your environment variables.');
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (!supabase) {
  throw new Error('Supabase client could not be created. Check your environment variables.');
}
