function partialReveal(value) {
  if (!value) return { set: false };
  return {
    set: true,
    length: value.length,
    start: value.slice(0, 8),
    end: value.slice(-8),
  };
}

module.exports = async (req, res) => {
  return res.status(200).json({
    ADMIN_PASSWORD_HASH: partialReveal(process.env.ADMIN_PASSWORD_HASH),
    SESSION_SECRET: partialReveal(process.env.SESSION_SECRET),
    BLOB_READ_WRITE_TOKEN: partialReveal(process.env.BLOB_READ_WRITE_TOKEN),
    nodeVersion: process.version,
  });
};
