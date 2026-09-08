let kv = null;
try {
  kv = require("@vercel/kv").kv;
} catch {
  kv = null;
}

const REQUIRED_KEYS = ["siteText", "footerInfo", "logo", "categories", "products", "tips", "services"];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  if (!kv) {
    return res.status(503).json({ error: "storage_not_configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "invalid_json" }); }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "invalid_body" });
  }

  const missing = REQUIRED_KEYS.filter((k) => !(k in body));
  if (missing.length) {
    return res.status(400).json({ error: "missing_fields", fields: missing });
  }

  try {
    await kv.set("catalog", body);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error guardando en Vercel KV:", err);
    return res.status(500).json({ error: "save_failed" });
  }
};
