const { supabase } = require('../lib/supabase')

function json(res, code, body) {
  res.setHeader('Content-Type', 'application/json')
  res.status(code).end(JSON.stringify(body))
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })

  const email = String(req.query.email || '').trim().toLowerCase()
  if (!email) return json(res, 400, { error: 'Missing email' })

  const { data, error } = await supabase
    .from('pros')
    .select('email, expires_at')
    .eq('email', email)
    .maybeSingle()

  if (error) return json(res, 500, { error: 'DB error' })

  const expires_at = data && data.expires_at ? data.expires_at : null
  const active = expires_at ? new Date(expires_at).getTime() > Date.now() : false

  json(res, 200, { active, expires_at })
}
