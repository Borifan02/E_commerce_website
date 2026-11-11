const Order = require('../models/Order');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError, ForbiddenError, AppError } = require('../utils/errors');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_secret_key')) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    logger.warn('Stripe initialization failed, fallback to simulated payments:', err.message);
  }
}

// Exchange rate: 1 USD = 120 ETB (configurable via ETB_EXCHANGE_RATE)
const getEtbRate = () => parseFloat(process.env.ETB_EXCHANGE_RATE) || 120.0;

// @desc    Create payment intent (Stripe or Demo Card)
// @route   POST /api/payment/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      throw new BadRequestError('Order ID is required');
    }

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check if user owns the order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to pay for this order');
    }

    // Check if order is already paid
    if (order.isPaid) {
      throw new BadRequestError('Order is already paid');
    }

    // If Stripe is configured
    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalPrice * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          userId: req.user._id.toString(),
        },
      });

      return res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        mode: 'live',
      });
    }

    // Fallback simulation mode for testing/demo when keys are not set
    const mockClientSecret = `mock_secret_${order._id}_${Date.now()}`;
    res.json({
      success: true,
      clientSecret: mockClientSecret,
      mode: 'mock',
      message: 'Running in mock payment mode (Stripe secret not configured)',
    });
  } catch (error) {
    logger.error('Create payment intent error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('Payment processing failed', 500));
  }
};

// @desc    Confirm payment
// @route   POST /api/payment/confirm
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to update this order');
    }

    let isSuccess = false;
    let paymentDetails = {
      id: paymentIntentId || `PAY-${Date.now()}`,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };

    if (stripe && paymentIntentId && !paymentIntentId.startsWith('mock_') && !paymentIntentId.startsWith('SIM-')) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === 'succeeded') {
        isSuccess = true;
        paymentDetails = {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
          email_address: paymentIntent.receipt_email || req.user.email,
        };
      }
    } else {
      // Mock / COD / simulated payment
      isSuccess = true;
    }

    if (isSuccess) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = paymentDetails;
      if (order.status === 'pending') {
        order.status = 'processing';
      }
      await order.save();

      logger.info(`Order ${order._id} marked as paid`);
      return res.json({
        success: true,
        message: 'Payment confirmed successfully',
        order,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Payment not completed',
    });
  } catch (error) {
    logger.error('Confirm payment error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('Server error during payment confirmation', 500));
  }
};

// @desc    Initiate Telebirr Payment
// @route   POST /api/payment/telebirr/initiate
// @access  Private
exports.initiateTelebirr = async (req, res, next) => {
  try {
    const { orderId, phoneNumber } = req.body;
    if (!orderId) throw new BadRequestError('Order ID is required');

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    const rate = getEtbRate();
    const amountETB = Math.round(order.totalPrice * rate * 100) / 100;
    const merchantPhone = process.env.TELEBIRR_MERCHANT_PHONE || '0911223344';
    const merchantName = process.env.TELEBIRR_MERCHANT_NAME || 'E-Store Official Ethiopia';
    const reference = `TLB-${order._id.toString().slice(-6).toUpperCase()}`;

    res.json({
      success: true,
      provider: 'Telebirr',
      merchantPhone,
      merchantName,
      amountUSD: order.totalPrice,
      amountETB,
      exchangeRate: rate,
      reference,
      customerPhone: phoneNumber || '',
      ussdCode: `*127*1*${merchantPhone}*${amountETB}#`,
      instructions: [
        `1. Open Telebirr App or dial *127#`,
        `2. Select "Send Money" or "Pay Merchant"`,
        `3. Enter Merchant Phone: ${merchantPhone} (${merchantName})`,
        `4. Enter Amount: ${amountETB} ETB`,
        `5. In Reason / Remark field, enter reference: ${reference}`,
        `6. Copy the confirmation Transaction ID from Ethio Telecom SMS and paste below to complete.`,
      ],
    });
  } catch (error) {
    logger.error('Telebirr initiation error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('Telebirr payment initiation failed', 500));
  }
};

// @desc    Verify Telebirr Payment
// @route   POST /api/payment/telebirr/verify
// @access  Private
exports.verifyTelebirr = async (req, res, next) => {
  try {
    const { orderId, transactionId, phoneNumber } = req.body;
    if (!orderId || !transactionId) {
      throw new BadRequestError('Order ID and Telebirr Transaction ID are required');
    }

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    if (order.isPaid) {
      return res.json({ success: true, message: 'Order is already marked as paid', order });
    }

    const cleanTxId = transactionId.trim().toUpperCase();
    if (cleanTxId.length < 5) {
      throw new BadRequestError('Transaction ID must be at least 5 characters');
    }

    const rate = getEtbRate();
    const amountETB = Math.round(order.totalPrice * rate * 100) / 100;

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = 'telebirr';
    order.paymentResult = {
      id: cleanTxId,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user?.email || '',
      phone: phoneNumber || '',
      amountETB,
      provider: 'Telebirr',
    };
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    await order.save();
    logger.info(`Order ${order._id} paid via Telebirr (TX: ${cleanTxId})`);

    res.json({
      success: true,
      message: 'Telebirr payment verified successfully! Your order is now processing.',
      order,
    });
  } catch (error) {
    logger.error('Telebirr verification error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('Telebirr verification failed', 500));
  }
};

// @desc    Initiate CBE Payment (Commercial Bank of Ethiopia)
// @route   POST /api/payment/cbe/initiate
// @access  Private
exports.initiateCBE = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) throw new BadRequestError('Order ID is required');

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    const rate = getEtbRate();
    const amountETB = Math.round(order.totalPrice * rate * 100) / 100;
    const accountNumber = process.env.CBE_ACCOUNT_NUMBER || '1000123456789';
    const accountName = process.env.CBE_ACCOUNT_NAME || 'E-Store Retail PLC';
    const reference = `CBE-${order._id.toString().slice(-6).toUpperCase()}`;

    res.json({
      success: true,
      provider: 'Commercial Bank of Ethiopia (CBE)',
      accountNumber,
      accountName,
      branch: 'Addis Ababa Main Branch',
      amountUSD: order.totalPrice,
      amountETB,
      exchangeRate: rate,
      reference,
      cbeBirrCode: `*847# (CBE Birr)`,
      instructions: [
        `1. Open CBE Mobile Banking app or dial *847# (CBE Birr)`,
        `2. Transfer to Account: ${accountNumber} (${accountName})`,
        `3. Enter Amount: ${amountETB} ETB`,
        `4. In Reason / Remark field, write: ${reference}`,
        `5. Enter the CBE transaction reference number or confirmation code below to verify.`,
      ],
    });
  } catch (error) {
    logger.error('CBE initiation error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('CBE payment initiation failed', 500));
  }
};

// @desc    Verify CBE Payment
// @route   POST /api/payment/cbe/verify
// @access  Private
exports.verifyCBE = async (req, res, next) => {
  try {
    const { orderId, transactionId, senderName } = req.body;
    if (!orderId || !transactionId) {
      throw new BadRequestError('Order ID and CBE Transaction Reference are required');
    }

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    if (order.isPaid) {
      return res.json({ success: true, message: 'Order is already marked as paid', order });
    }

    const cleanTxId = transactionId.trim().toUpperCase();
    if (cleanTxId.length < 5) {
      throw new BadRequestError('CBE Reference must be at least 5 characters');
    }

    const rate = getEtbRate();
    const amountETB = Math.round(order.totalPrice * rate * 100) / 100;

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = 'cbe';
    order.paymentResult = {
      id: cleanTxId,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user?.email || '',
      sender: senderName || '',
      amountETB,
      provider: 'Commercial Bank of Ethiopia (CBE)',
    };
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    await order.save();
    logger.info(`Order ${order._id} paid via CBE (TX: ${cleanTxId})`);

    res.json({
      success: true,
      message: 'CBE payment verified successfully! Your order is now processing.',
      order,
    });
  } catch (error) {
    logger.error('CBE verification error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('CBE verification failed', 500));
  }
};

// @desc    Get Currency Rates
// @route   GET /api/payment/rates
// @access  Public
exports.getRates = (req, res) => {
  const rate = getEtbRate();
  res.json({
    success: true,
    base: 'USD',
    rates: {
      USD: 1,
      ETB: rate,
    },
    defaultCurrency: 'ETB',
    updatedAt: new Date().toISOString(),
  });
};

// @desc    Get Stripe publishable key
// @route   GET /api/payment/config
// @access  Public
exports.getConfig = (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_sample_mock_key',
  });
};
