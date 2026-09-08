const { requireAuth } = require("./_lib/require-auth");

let blobPut = null;
try {
  blobPut = require("@vercel/blob").put;
} catch {
  blobPut = null;
}

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!requireAuth(req, res)) return;

  if (!blobPut) {
    return res.status(503).json({ error: "storage_not_configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "invalid_json" }); }
  }

  const { filename, dataUrl } = body || {};
  if (!filename || !dataUrl || typeof dataUrl !== "string") {
    return res.status(400).json({ error: "invalid_image" });
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: "invalid_image_format" });
  }
  const contentType = match[1];
  if (!ALLOWED_TYPES.includes(contentType)) {
    return res.status(415).json({ error: "unsupported_image_type" });
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_BYTES) {
    return res.status(413).json({ error: "image_too_large", maxBytes: MAX_BYTES });
  }

  const extByType = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const safeName = filename.replace(/\.[a-zA-Z0-9]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  const finalName = `${safeName}.${extByType[contentType]}`;

  try {
    const blob = await blobPut(`catalogo/${Date.now()}-${finalName}`, buffer, {
      access: "public",
      contentType,
    });
    return res.status(200).json({ ok: true, url: blob.url });
  } catch (err) {
    console.error("Error subiendo a Vercel Blob:", err);
    return res.status(500).json({ error: "upload_failed" });
  }
};
