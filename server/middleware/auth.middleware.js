const jwt = require('jsonwebtoken');

/**
 * Express middleware that verifies a Bearer JWT in the Authorization header.
 * On success, attaches req.userId and calls next().
 * On failure, responds with HTTP 401 { error: "No autorizado" }.
 */
function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'No autorizado' });
  }
}

module.exports = { verifyJWT };
