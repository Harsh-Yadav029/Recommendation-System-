const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Gateway Security & Auth', () => {
  let csrfToken;
  let cookies;
  
  it('GET /health should return 200 (public)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('ok');
  });

  it('POST /api/auth/session should issue tokens and CSRF', async () => {
    const res = await request(app).post('/api/auth/session');
    expect(res.status).to.equal(200);
    expect(res.body.csrfToken).to.be.a('string');
    csrfToken = res.body.csrfToken;
    
    // Extract cookies
    cookies = res.headers['set-cookie'];
    expect(cookies).to.be.an('array');
    expect(cookies.some(c => c.includes('access_token='))).to.be.true;
    expect(cookies.some(c => c.includes('refresh_token='))).to.be.true;
  });

  it('POST /api/interactions/log should fail without CSRF token', async () => {
    const res = await request(app)
      .post('/api/interactions/log')
      .set('Cookie', cookies)
      .send({
        item_id: '123',
        domain: 'retailrocket',
        event_type: 'view'
      });
      
    // CSRF middleware catches it
    expect(res.status).to.equal(403);
    expect(res.body.error).to.equal('Invalid CSRF token');
  });
  
  it('POST /api/interactions/log should pass CSRF but fail validation if missing fields (or ML unreachable)', async () => {
    const res = await request(app)
      .post('/api/interactions/log')
      .set('Cookie', cookies)
      .set('x-csrf-token', csrfToken)
      .send({
        // missing item_id
        domain: 'retailrocket',
        event_type: 'view'
      });
      
    // Zod validation should catch it before ML service
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal('Validation error');
  });
  
  it('POST /api/interactions/log should proxy successfully (or 502 if ML service is down)', async () => {
    const res = await request(app)
      .post('/api/interactions/log')
      .set('Cookie', cookies)
      .set('x-csrf-token', csrfToken)
      .send({
        item_id: '123',
        domain: 'retailrocket',
        event_type: 'view'
      });
      
    // If ML service is not running, we expect 502 Bad Gateway instead of crash
    expect([200, 502]).to.include(res.status);
  });
});
