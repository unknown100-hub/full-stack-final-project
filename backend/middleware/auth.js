const jwt = require('jsonwebtoken');

// Verifies Bearer token and attaches userId to req
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
  if (!token) return res.status(401).json({ msg: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    return next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
}

module.exports = verifyToken;

