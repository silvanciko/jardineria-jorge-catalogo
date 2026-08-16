const { verifySessionCookie } = require("./auth");

/**
 * Corta la ejecución con 401 si no hay una sesión de admin válida.
 * Uso en cualquier endpoint protegido:
 *   if (!requireAuth(req, res)) return;
 */
function requireAuth(req, res) {
  if (!verifySessionCookie(req.headers.cookie)) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

module.exports = { requireAuth };
