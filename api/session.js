const { verifySessionCookie } = require("./_lib/auth");

module.exports = async (req, res) => {
  const authenticated = verifySessionCookie(req.headers.cookie);
  return res.status(200).json({ authenticated });
};
