const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json());

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'gateway' });
});

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
