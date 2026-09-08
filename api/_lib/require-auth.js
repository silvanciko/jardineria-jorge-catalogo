const { verifySessionCookie } = require("./auth");

function requireAuth(req, res) {
  if (!verifySessionCookie(req.headers.cookie)) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

module.exports = { requireAuth };
