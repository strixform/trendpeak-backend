const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.warn('Supabase env not set')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
  global: { headers: { 'x-application-name': 'trendpeak' } }
})

module.exports = { supabase }
