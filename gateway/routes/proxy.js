const express = require('express');
const axios = require('axios');
const { z } = require('zod');

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Pull enabled domains from env, falling back to the defaults
const rawDomains = process.env.ENABLED_DOMAINS || 'retailrocket,steam,bookcrossing';
const ENABLED_DOMAINS = rawDomains.split(',').map(d => d.trim());

// Validation schemas
// We must cast to a tuple type for zod enum:
const domainSchema = z.enum([ENABLED_DOMAINS[0], ...ENABLED_DOMAINS.slice(1)], {
  errorMap: () => ({ message: `Invalid domain. Must be one of: ${ENABLED_DOMAINS.join(', ')}` }),
});

const userProfileSchema = z.object({
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  history: z.array(z.string()).optional().default([]),
});

const constraintsSchema = z.record(z.any());

const getRecommendationsSchema = z.object({
  user_profile: userProfileSchema,
  constraints: constraintsSchema,
});

const compareSchema = z.object({
  item_ids: z.array(z.string()).min(2).max(4),
});

const logInteractionSchema = z.object({
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  item_id: z.string(),
  domain: domainSchema,
  event_type: z.enum(['view', 'cart', 'purchase', 'rating', 'play', 'compare_select']),
  value: z.number().optional(),
});

// Helper for proxy errors
const handleProxyError = (err, res) => {
  if (err.response) {
    // FastAPI returned an error
    return res.status(err.response.status).json({
      error: 'Upstream service error',
      details: err.response.data,
    });
  }
  console.error("Gateway proxy error:", err.message);
  return res.status(502).json({ error: 'Bad Gateway - ML service unreachable' });
};

// Axios instance
const api = axios.create({ baseURL: ML_SERVICE_URL });

// GET /api/recommend/:domain -> POST to ML service (since it takes a body)
router.post('/recommend/:domain', async (req, res) => {
  try {
    const domain = domainSchema.parse(req.params.domain);
    const body = getRecommendationsSchema.parse(req.body);
    
    // Explicitly attach session_id from JWT if not provided in body (or override it)
    body.user_profile.session_id = req.user.session_id;

    const response = await api.post(`/api/recommend/${domain}`, body);
    return res.json(response.data);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation error', details: err.errors });
    return handleProxyError(err, res);
  }
});

// POST /api/compare/:domain -> POST to ML service
router.post('/compare/:domain', async (req, res) => {
  try {
    const domain = domainSchema.parse(req.params.domain);
    const body = compareSchema.parse(req.body);

    const response = await api.post(`/api/compare/${domain}`, body);
    return res.json(response.data);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation error', details: err.errors });
    return handleProxyError(err, res);
  }
});

// POST /api/cold-start/:domain -> POST to ML service
router.post('/cold-start/:domain', async (req, res) => {
  try {
    const domain = domainSchema.parse(req.params.domain);
    // preference_answers is unconstrained dict
    const body = req.body;

    const response = await api.post(`/api/cold-start/${domain}`, body);
    return res.json(response.data);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation error', details: err.errors });
    return handleProxyError(err, res);
  }
});

// POST /api/interactions/log -> POST to ML service
router.post('/interactions/log', async (req, res) => {
  try {
    const body = logInteractionSchema.parse(req.body);
    body.session_id = req.user.session_id; // override with JWT authenticated session
    
    const response = await api.post('/api/interactions/log', body);
    return res.json(response.data);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation error', details: err.errors });
    return handleProxyError(err, res);
  }
});
// POST /api/assistant/chat -> POST to ML service
router.post('/assistant/chat', async (req, res) => {
  try {
    const response = await api.post('/api/assistant/chat', req.body);
    return res.json(response.data);
  } catch (err) {
    return handleProxyError(err, res);
  }
});

module.exports = router;
