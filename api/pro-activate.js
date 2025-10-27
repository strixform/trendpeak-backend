const { supabase } = require('../lib/supabase')

function json(res, code, body) {
  res.setHeader('Content-Type', 'application/json')
  res.status(code).end(JSON.stringify(body))
}
function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + Number(days || 30))
  return d.toISOString()
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  const { email, days } = req.body || {}
  if (!email) return json(res, 400, { error: 'Missing email' })

  const lower = String(email).trim().toLowerCase()
  const nowIso = new Date().toISOString()
  const expires_at = addDays(days || 30)

  const { error } = await supabase
    .from('pros')
    .upsert({ email: lower, started_at: nowIso, expires_at })

  if (error) return json(res, 500, { error: 'DB error' })
  json(res, 200, { ok: true, expires_at })
}
