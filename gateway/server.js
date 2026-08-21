require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log('Gateway connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const express = require('express');
const cookieParser = require('cookie-parser');
const { helmetMiddleware, corsMiddleware, rateLimiter, csrfProtection, csrfGenerate } = require('./middleware/security');
const { verifyToken } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const proxyRoutes = require('./routes/proxy');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimiter);

// Parsers
app.use(express.json());
app.use(cookieParser());

// Apply CSRF to /api/auth/session to allow token generation without validation
app.use('/api/auth/session', csrfGenerate);

// Auth routes
app.use('/api/auth', authRoutes);

// Apply strict CSRF protection to all state-changing routes after this point
app.use(csrfProtection);

// Public healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway' });
});

// Protected Proxy routes
app.use('/api', verifyToken, proxyRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  console.error("Unhandled Gateway Error:", err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server (only if not required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Gateway listening on port ${PORT}`);
  });
}

module.exports = app; // For testing
