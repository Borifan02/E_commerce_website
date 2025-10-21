const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// @desc    Create payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user._id.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id.toString(),
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment processing'
    });
  }
});

// @desc    Confirm payment
// @route   POST /api/payment/confirm
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order as paid
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: paymentIntent.receipt_email || req.user.email,
      };

      await order.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        order,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment confirmation'
    });
  }
});

// @desc    Get Stripe publishable key
// @route   GET /api/payment/config
// @access  Public
router.get('/config', (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here',
  });
});

module.exports = router;
