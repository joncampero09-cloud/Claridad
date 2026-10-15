const uso = new Map();

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "no_key" });

  const ip = String(req.headers["x-forwarded-for"] || "anon").split(",")[0].trim();
  const clave = ip + new Date().toISOString().slice(0, 10);
  const n = (uso.get(clave) || 0) + 1;
  uso.set(clave, n);
  if (n > (Number(process.env.DAILY_LIMIT) || 30)) return res.status(429).json({ error: "limit" });

  const msgs = req.body && req.body.messages;
  const ok = Array.isArray(msgs) && msgs.length >= 1 && msgs.length <= 24 &&
    msgs.every(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") &&
    msgs[msgs.length - 1].role === "user" &&
    msgs.reduce((t, m) => t + m.content.length, 0) <= 12000;
  if (!ok) return res.status(400).json({ error: "bad_request" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY.trim(),
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({ model: (process.env.MODEL || "claude-sonnet-5-5").trim(), max_tokens: 900, messages: msgs })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      const detalle = (d && d.error && d.error.message) || "sin detalle";
      return res.status(502).json({ error: "upstream", status: r.status, detalle });
    }
    const text = (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: "upstream", detalle: String(e && e.message) });
  }
};
