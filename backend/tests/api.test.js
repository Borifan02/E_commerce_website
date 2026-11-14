const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../server');

test('API Endpoints - Integration Sanity Tests', async (t) => {
  let server;
  let baseUrl;

  await t.test('Server boot and port binding', () => {
    return new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  await t.test('GET /api/health responds with 200 or 503 and valid diagnostics', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.ok(res.status === 200 || res.status === 503);
    const data = await res.json();
    assert.ok(data.status);
    assert.ok(data.uptime !== undefined);
    assert.strictEqual(data.docs, '/api/docs');
  });

  await t.test('GET /api/docs.json serves Swagger OpenAPI specification', async () => {
    const res = await fetch(`${baseUrl}/api/docs.json`);
    assert.strictEqual(res.status, 200);
    const spec = await res.json();
    assert.strictEqual(spec.openapi, '3.0.0');
    assert.strictEqual(spec.info.title, 'E-Commerce Platform REST API');
  });

  await t.test('GET /api/payment/rates returns ETB and USD exchange rates', async () => {
    const res = await fetch(`${baseUrl}/api/payment/rates`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.rates.ETB >= 1);
  });

  await t.test('GET /unknown-route returns clean 404 JSON', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent-route-xyz`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test('POST /api/payment/telebirr/verify rejects unauthenticated requests', async () => {
    const res = await fetch(`${baseUrl}/api/payment/telebirr/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'test123', transactionId: 'TLB123', pin: '1234' }),
    });
    assert.strictEqual(res.status, 401);
  });

  await t.test('POST /api/payment/cbe/verify rejects unauthenticated requests', async () => {
    const res = await fetch(`${baseUrl}/api/payment/cbe/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'test123', transactionId: 'FT123', pin: '1234' }),
    });
    assert.strictEqual(res.status, 401);
  });

  await t.test('Teardown test server', () => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });
});
