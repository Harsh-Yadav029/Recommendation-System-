const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { registerUser, loginUser, logoutUser } = require('../controllers/auth.controller');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// 15 minutes access token, 7 days refresh token
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

// POST /api/auth/session -> Initial anonymous session creation (or restore)
router.post('/session', (req, res) => {
  let sessionId;
  let role = 'anonymous';
  let userId = null;
  let email = null;
  let isReturning = false;

  const token = req.cookies.access_token || req.cookies.refresh_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      sessionId = decoded.session_id;
      role = decoded.role || 'anonymous';
      userId = decoded.user_id;
      email = decoded.email;
      isReturning = true;
    } catch (e) {}
  }

  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  
  const payload = { session_id: sessionId, role, user_id: userId, email };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  
  // Set cookies
  res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
  
  // Provide CSRF token on initial session creation
  const csrfToken = req.csrfToken();
  
  return res.json({
    status: 'success',
    message: isReturning ? 'Session restored' : 'Anonymous session created',
    csrfToken,
    user: role === 'registered' ? { id: userId, email } : null,
    isReturning
  });
});

// POST /api/auth/refresh -> Refresh token explicitly
router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // Payload for new access token
    const payload = { session_id: decoded.session_id, role: decoded.role || 'anonymous' };
    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    
    res.cookie('access_token', newAccessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    
    return res.json({ status: 'success', message: 'Token refreshed' });
  } catch (err) {
    // If refresh token is expired or invalid, they must get a new session
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.status(401).json({ error: 'Invalid or expired refresh token. Please request a new session.' });
  }
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

module.exports = router;
