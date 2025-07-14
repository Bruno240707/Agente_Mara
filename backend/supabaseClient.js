process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://cktbpfzieczvjrtepiuh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdGJwZnppZWN6dmpydGVwaXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTEyNDUsImV4cCI6MjA2MzU4NzI0NX0.wvorf0-d2MNLbr_6tttZFelvvogW5Uh_e9aiIwYaujs'
export const supabase = createClient(supabaseUrl, supabaseKey)