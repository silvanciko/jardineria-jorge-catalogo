/**
 * api/_lib/auth.js
 * -----------------------------------------------------------------------
 * Maneja la sesión del panel admin con una cookie firmada (HMAC-SHA256).
 *
 * Por qué esto es seguro:
 * - La cookie es HttpOnly → JavaScript del navegador NO puede leerla
 *   (protege contra robo por XSS).
 * - Es Secure → solo viaja por HTTPS.
 * - Está firmada con SESSION_SECRET (variable de entorno del servidor)
 *   → nadie puede fabricar una cookie válida sin conocer ese secreto,
 *   que nunca se envía al navegador.
 * - Tiene expiración incluida y verificada en el servidor.
 * -----------------------------------------------------------------------
 */

const crypto = require("crypto");

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta configurar la variable de entorno SESSION_SECRET.");
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function createSessionCookie() {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const value = String(expiresAt);
  const signature = sign(value);
  const token = `${value}.${signature}`;
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function verifySessionCookie(cookieHeader) {
  if (!cookieHeader) return false;

  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;

  const token = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
  const [value, signature] = token.split(".");
  if (!value || !signature) return false;

  let expectedBuffer, signatureBuffer;
  try {
    expectedBuffer = Buffer.from(sign(value), "hex");
    signatureBuffer = Buffer.from(signature, "hex");
  } catch {
    return false;
  }

  if (expectedBuffer.length !== signatureBuffer.length) return false;
  if (!crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) return false;

  if (Number(value) < Date.now()) return false; // sesión expirada

  return true;
}

module.exports = { createSessionCookie, clearSessionCookie, verifySessionCookie, COOKIE_NAME };
