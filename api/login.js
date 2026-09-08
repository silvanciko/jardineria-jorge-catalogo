/**
 * api/login.js
 * -----------------------------------------------------------------------
 * La contraseña vive directamente aquí para garantizar que el login
 * funcione siempre, sin depender de configurar variables de entorno
 * en Vercel (eso fue la causa de muchos problemas anteriores).
 *
 * Para cambiar la contraseña más adelante: edita ADMIN_PASSWORD abajo
 * y vuelve a subir este archivo.
 * -----------------------------------------------------------------------
 */

const crypto = require("crypto");
const { createSessionCookie } = require("./_lib/auth");

const ADMIN_PASSWORD = "Messi12345s";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const password = (body && body.password) || "";

  // Pequeña demora fija: dificulta ataques automatizados de fuerza bruta.
  await new Promise((r) => setTimeout(r, 300));

  const a = Buffer.from(String(password));
  const b = Buffer.from(ADMIN_PASSWORD);
  const isValid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!isValid) {
    return res.status(401).json({ error: "invalid_password" });
  }

  res.setHeader("Set-Cookie", createSessionCookie());
  return res.status(200).json({ ok: true });
};
