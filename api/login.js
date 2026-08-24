const crypto = require("crypto");
const { createSessionCookie } = require("./_lib/auth");

/**
 * Compara la contraseña recibida contra el hash guardado en
 * ADMIN_PASSWORD_HASH (formato "salt:hash", generado con
 * scripts/hash-password.js). Usa timingSafeEqual para no filtrar
 * información por tiempo de respuesta.
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  let derivedKey, keyBuffer;
  try {
    derivedKey = crypto.scryptSync(password, salt, 64);
    keyBuffer = Buffer.from(key, "hex");
  } catch {
    return false;
  }
  if (derivedKey.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(derivedKey, keyBuffer);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const password = body && body.password;

  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "missing_password" });
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHash) {
    console.error("Falta configurar ADMIN_PASSWORD_HASH en las variables de entorno de Vercel.");
    return res.status(500).json({ error: "server_misconfigured" });
  }

  // Pequeña demora fija: dificulta ataques automatizados de fuerza bruta.
  await new Promise((r) => setTimeout(r, 300));

   if (!verifyPassword(password, storedHash)) {
    return res.status(401).json({
      error: "invalid_password",
      debug_receivedLength: password.length,
      debug_hashPreview: storedHash.slice(0, 8),
    });
  }

  res.setHeader("Set-Cookie", createSessionCookie());
  return res.status(200).json({ ok: true });
};
