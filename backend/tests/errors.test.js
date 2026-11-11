const test = require('node:test');
const assert = require('node:assert');
const {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} = require('../utils/errors');

test('Error Classes - Hierarchy and Status Codes', async (t) => {
  await t.test('AppError sets message, statusCode, and operational status', () => {
    const err = new AppError('Something went wrong', 500);
    assert.strictEqual(err.message, 'Something went wrong');
    assert.strictEqual(err.statusCode, 500);
    assert.strictEqual(err.isOperational, true);
  });

  await t.test('NotFoundError produces 404 with standard message', () => {
    const err = new NotFoundError('Product');
    assert.strictEqual(err.statusCode, 404);
    assert.strictEqual(err.message, 'Product not found');
    assert.strictEqual(err.name, 'NotFoundError');
  });

  await t.test('BadRequestError produces 400', () => {
    const err = new BadRequestError('Invalid input field');
    assert.strictEqual(err.statusCode, 400);
    assert.strictEqual(err.message, 'Invalid input field');
    assert.strictEqual(err.name, 'BadRequestError');
  });

  await t.test('UnauthorizedError produces 401', () => {
    const err = new UnauthorizedError('Invalid credentials');
    assert.strictEqual(err.statusCode, 401);
    assert.strictEqual(err.message, 'Invalid credentials');
  });

  await t.test('ForbiddenError produces 403', () => {
    const err = new ForbiddenError('Admin access required');
    assert.strictEqual(err.statusCode, 403);
    assert.strictEqual(err.message, 'Admin access required');
  });

  await t.test('ConflictError produces 409', () => {
    const err = new ConflictError('User already exists');
    assert.strictEqual(err.statusCode, 409);
    assert.strictEqual(err.message, 'User already exists');
  });

  await t.test('ValidationError produces 400 with errors payload', () => {
    const errors = [{ field: 'email', message: 'Invalid email' }];
    const err = new ValidationError('Validation error', errors);
    assert.strictEqual(err.statusCode, 400);
    assert.deepStrictEqual(err.errors, errors);
  });
});
