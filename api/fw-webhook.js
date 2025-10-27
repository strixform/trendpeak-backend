const { supabase } = require('../lib/supabase')

function json(res, code, body) {
  res.setHeader('Content-Type', 'application/json')
  res.status(code).end(JSON.stringify(body))
}

function bad(res) {
  json(res, 400, { ok: false })
}

function ok(res) {
  json(res, 200, { ok: true })
}

function addDays(iso, days) {
  const d = iso ? new Date(iso) : new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return bad(res)

  const secret = process.env.FLW_WEBHOOK_SECRET || ''
  const sig = req.headers['verif-hash'] || ''
  if (!secret || sig !== secret) return bad(res)

  const evt = req.body || {}

  const type = evt.event || evt.type || ''
  const data = evt.data || evt
  const status = data.status || ''
  const cust = data.customer || {}
  const email = (cust.email || '').toLowerCase()

  if (!email) return ok(res)

  if (type === 'charge.completed' && status === 'successful') {
    const nowIso = new Date().toISOString()
    const { data: row } = await supabase
      .from('pros')
      .select('email, expires_at')
      .eq('email', email)
      .maybeSingle()

    let newExpiry
    if (row && row.expires_at && new Date(row.expires_at).getTime() > Date.now()) {
      newExpiry = addDays(row.expires_at, 30)
    } else {
      newExpiry = addDays(nowIso, 30)
    }

    await supabase
      .from('pros')
      .upsert({ email, started_at: nowIso, expires_at: newExpiry })

    return ok(res)
  }

  return ok(res)
}
