import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "trendpeak-backend" });
});

// mock timeline for 30 days with one spike
function mockTimeline() {
  const out = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const base = 40 + 10 * Math.sin((30 - i) / 3) + randInt(-3, 3);
    out.push({ t: d.toISOString().slice(0, 10), v: Math.max(0, Math.round(base)) });
  }
  const k = randInt(10, 26);
  out[k].v += randInt(30, 80);
  return out;
}

function detectSpikes(timeline) {
  const vals = timeline.map(p => p.v);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) * (v - mean), 0) / vals.length);
  const spikes = [];
  for (const p of timeline) {
    if (p.v > mean + 2 * std) {
      const percent = Math.round(100 * (p.v - mean) / Math.max(1, mean));
      spikes.push({ time: p.t, percent, reason: "Likely news or viral post" });
    }
  }
  return spikes;
}

function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// main endpoint
app.get("/api/trend", (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Missing q" });
  const timeline = mockTimeline();
  const spikes = detectSpikes(timeline);
  const top_sources = [
    { site: "news.sample", title: `${q} got media pickup`, url: "https://example.com/a" },
    { site: "reddit", title: `Hot thread about ${q}`, url: "https://example.com/b" }
  ];
  res.json({
    query: q,
    timeline,
    spikes,
    top_sources
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`TrendPeak API on ${PORT}`);
});
