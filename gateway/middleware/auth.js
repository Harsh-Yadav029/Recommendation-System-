const jwt = require('jsonwebtoken');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  
  if (!token) {
    // No access token at all — try to silently refresh from refresh_token
    return tryRefresh(req, res, next);
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Access token expired — try to silently refresh
      return tryRefresh(req, res, next);
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

function tryRefresh(req, res, next) {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Access token missing or expired. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    // Issue a fresh access token with the same payload
    const payload = {
      session_id: decoded.session_id,
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role
    };
    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    res.cookie('access_token', newAccessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    req.user = payload;
    next();
  } catch (refreshErr) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

module.exports = {
  verifyToken
};
