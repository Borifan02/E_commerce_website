const test = require('node:test');
const assert = require('node:assert');
const CONSTANTS = require('../utils/constants');

test('System Constants - Business Rules Integrity', async (t) => {
  await t.test('Product categories include standard e-commerce departments', () => {
    assert.ok(Array.isArray(CONSTANTS.PRODUCT_CATEGORIES));
    assert.ok(CONSTANTS.PRODUCT_CATEGORIES.includes('Electronics'));
    assert.ok(CONSTANTS.PRODUCT_CATEGORIES.includes('Clothing'));
    assert.ok(CONSTANTS.PRODUCT_CATEGORIES.includes('Books'));
  });

  await t.test('Order statuses include all state-machine states', () => {
    const statuses = Object.values(CONSTANTS.ORDER_STATUS);
    assert.ok(Array.isArray(statuses));
    assert.ok(statuses.includes('pending'));
    assert.ok(statuses.includes('processing'));
    assert.ok(statuses.includes('shipped'));
    assert.ok(statuses.includes('delivered'));
    assert.ok(statuses.includes('cancelled'));
  });

  await t.test('Tax and shipping constants are positive numbers', () => {
    assert.ok(CONSTANTS.TAX.RATE >= 0);
    assert.ok(CONSTANTS.SHIPPING.STANDARD_COST >= 0);
    assert.ok(CONSTANTS.SHIPPING.FREE_THRESHOLD > 0);
  });

  await t.test('Pagination has sensible bounds', () => {
    assert.strictEqual(CONSTANTS.PAGINATION.DEFAULT_PAGE, 1);
    assert.ok(CONSTANTS.PAGINATION.DEFAULT_LIMIT > 0);
    assert.ok(CONSTANTS.PAGINATION.MAX_LIMIT >= CONSTANTS.PAGINATION.DEFAULT_LIMIT);
  });
});
