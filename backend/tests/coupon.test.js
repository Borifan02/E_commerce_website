const test = require('node:test');
const assert = require('node:assert');
const Coupon = require('../models/Coupon');

test('Coupon Model - Discount Calculation & Validity Rules', async (t) => {
  await t.test('Calculates percentage discount correctly', () => {
    const coupon = new Coupon({
      code: 'SAVE10',
      discountType: 'percentage',
      discountAmount: 10,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const discount = coupon.calculateDiscount(200);
    assert.strictEqual(discount, 20); // 10% of 200 = 20
  });

  await t.test('Respects maxDiscount cap on percentage coupons', () => {
    const coupon = new Coupon({
      code: 'BIG50',
      discountType: 'percentage',
      discountAmount: 50,
      maxDiscount: 25,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const discount = coupon.calculateDiscount(100); // 50% would be 50, capped at 25
    assert.strictEqual(discount, 25);
  });

  await t.test('Calculates fixed amount discount correctly', () => {
    const coupon = new Coupon({
      code: 'FLAT15',
      discountType: 'fixed',
      discountAmount: 15,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const discount = coupon.calculateDiscount(50);
    assert.strictEqual(discount, 15);
  });

  await t.test('Validates minimum order threshold', () => {
    const coupon = new Coupon({
      code: 'MIN50',
      discountType: 'fixed',
      discountAmount: 10,
      minOrderAmount: 50,
      expiresAt: new Date(Date.now() + 86400000),
      isActive: true,
    });

    const underMin = coupon.isValid(40);
    assert.strictEqual(underMin.valid, false);

    const overMin = coupon.isValid(60);
    assert.strictEqual(overMin.valid, true);
  });

  await t.test('Rejects expired coupon', () => {
    const expiredCoupon = new Coupon({
      code: 'OLDCOUPON',
      discountType: 'fixed',
      discountAmount: 10,
      expiresAt: new Date(Date.now() - 10000), // in the past
      isActive: true,
    });

    const check = expiredCoupon.isValid(100);
    assert.strictEqual(check.valid, false);
    assert.match(check.message, /expired/i);
  });
});
