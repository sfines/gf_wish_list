import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey as prodAnonKey } from './supabase/info';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const supabaseUrl = isLocal 
  ? 'http://127.0.0.1:54321' 
  : `https://${projectId}.supabase.co`;

const supabaseKey = isLocal
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  : prodAnonKey;

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}
