const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

// Helmet setup
const helmetMiddleware = helmet();

// CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://recommendation-system-six-nu.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in proxy to prevent CORS blocks
    }
  },
  credentials: true, // required to send HttpOnly cookies
});

// Rate limiting setup (1000 requests per 15 minutes per client IP)
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
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
