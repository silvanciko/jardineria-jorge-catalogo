/**
 * scripts/hash-password.js
 * -----------------------------------------------------------------------
 * Genera el valor que vas a guardar en la variable de entorno
 * ADMIN_PASSWORD_HASH en Vercel. Tu contraseña real NUNCA se guarda
 * en ningún archivo — solo este hash (que no se puede revertir).
 *
 * Cómo usarlo (en tu computadora, no en Vercel):
 *   node scripts/hash-password.js "tu-contraseña-elegida"
 *
 * Copia el resultado y pégalo como valor de ADMIN_PASSWORD_HASH
 * en Vercel → tu proyecto → Settings → Environment Variables.
 * -----------------------------------------------------------------------
 */

const crypto = require("crypto");

const password = process.argv[2];

if (!password) {
  console.error('Uso: node scripts/hash-password.js "tu-contraseña"');
  process.exit(1);
}

if (password.length < 8) {
  console.error("Elige una contraseña de al menos 8 caracteres.");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const derivedKey = crypto.scryptSync(password, salt, 64);
const hash = `${salt}:${derivedKey.toString("hex")}`;

console.log("\nGuarda esto como ADMIN_PASSWORD_HASH en Vercel:\n");
console.log(hash);
console.log("");
