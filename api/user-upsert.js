const { supabase } = require('../lib/supabase')

function json(res, code, body) {
  res.setHeader('Content-Type', 'application/json')
  res.status(code).end(JSON.stringify(body))
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  const { email } = req.body || {}
  if (!email) return json(res, 400, { error: 'Missing email' })

  const lower = String(email).trim().toLowerCase()
  const { error } = await supabase
    .from('users')
    .upsert({ email: lower, updated_at: new Date().toISOString() })

  if (error) return json(res, 500, { error: 'DB error' })

  json(res, 200, { ok: true })
}
