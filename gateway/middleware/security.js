const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

// Helmet setup
const helmetMiddleware = helmet();

// CORS setup
const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // required to send HttpOnly cookies
});

// Rate limiting setup (100 requests per 15 minutes)
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const csurf = require('csurf');

// CSRF Protection (stateless via cookie)
const csrfProtection = csurf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  } 
});

const csrfGenerate = csurf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE'] // Never validates
});

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  rateLimiter,
  csrfProtection,
  csrfGenerate
};
