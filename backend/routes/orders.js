const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, [
  body('orderItems').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('shippingAddress.name').trim().isLength({ min: 2 }).withMessage('Shipping name is required'),
  body('shippingAddress.street').trim().isLength({ min: 5 }).withMessage('Street address is required'),
  body('shippingAddress.city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('shippingAddress.state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('shippingAddress.zipCode').trim().isLength({ min: 3 }).withMessage('Zip code is required'),
  body('shippingAddress.country').trim().isLength({ min: 2 }).withMessage('Country is required'),
  body('shippingAddress.phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('paymentMethod').isIn(['stripe', 'paypal', 'cod']).withMessage('Invalid payment method')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
}, orderController.createOrder);

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, orderController.getUserOrders);

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, orderController.getOrderById);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, orderController.updateOrderToPaid);

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, authorize('admin'), orderController.updateOrderStatus);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
}, orderController.updateOrderStatus);

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), orderController.getAllOrders);

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
