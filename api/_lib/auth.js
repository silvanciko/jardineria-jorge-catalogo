/**
 * api/_lib/auth.js
 * -----------------------------------------------------------------------
 * Sesión del panel admin con cookie firmada (HMAC-SHA256).
 *
 * IMPORTANTE: para garantizar que esto funcione sin depender de que
 * las variables de entorno de Vercel estén bien configuradas, el
 * secreto de firma tiene un valor de respaldo directo aquí. Esto es
 * menos "perfecto" en seguridad que usar solo variables de entorno,
 * pero es la solución elegida para que el sistema funcione siempre.
 * Si más adelante quieres volver al modelo 100% por variables de
 * entorno, basta con quitar el valor de respaldo de la línea de abajo.
 * -----------------------------------------------------------------------
 */

const crypto = require("crypto");

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

const FALLBACK_SECRET = "097fc3c203364f37eacdae1010c8bc925c46e5cbcbe5f8968f40a007b45e8f67";

function getSecret() {
  return process.env.SESSION_SECRET || FALLBACK_SECRET;
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
  if (Number(value) < Date.now()) return false;

  return true;
}

module.exports = { createSessionCookie, clearSessionCookie, verifySessionCookie, COOKIE_NAME };
