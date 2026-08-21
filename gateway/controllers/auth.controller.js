const { User } = require('../models/user.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({ email, password });

    // Ensure session exists
    let sessionId;
    const token = req.cookies.access_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        sessionId = decoded.session_id;
      } catch (e) {}
    }
    if (!sessionId) {
      const crypto = require('crypto');
      sessionId = crypto.randomUUID();
    }

    const payload = { session_id: sessionId, user_id: user._id, email: user.email, role: 'registered' };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reuse existing session_id if possible
    let sessionId;
    const token = req.cookies.access_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        sessionId = decoded.session_id;
      } catch (e) {}
    }
    if (!sessionId) {
      const crypto = require('crypto');
      sessionId = crypto.randomUUID();
    }

    const payload = { session_id: sessionId, user_id: user._id, email: user.email, role: 'registered' };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
