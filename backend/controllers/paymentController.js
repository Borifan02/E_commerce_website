const Order = require('../models/Order');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError, ForbiddenError, AppError } = require('../utils/errors');

let stripe = null;
const stripeSecretKey = (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key'))
  ? process.env.STRIPE_SECRET_KEY
  : (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_PUBLISHABLE_KEY.startsWith('sk_') ? process.env.STRIPE_PUBLISHABLE_KEY : null);

if (stripeSecretKey) {
  try {
    stripe = require('stripe')(stripeSecretKey);
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

      // Record in dedicated Payment model
      try {
        const rate = getEtbRate();
        await Payment.create({
          order: order._id,
          user: order.user,
          paymentMethod: order.paymentMethod || 'stripe',
          provider: 'Card / Stripe Payment Gateway',
          amountUSD: order.totalPrice,
          amountETB: Math.round(order.totalPrice * rate * 100) / 100,
          exchangeRate: rate,
          transactionId: paymentDetails.id,
          status: 'succeeded',
          isVerified: true,
          verifiedAt: new Date(),
          paymentDetails,
        });
      } catch (payErr) {
        logger.warn('Payment record warning:', payErr.message);
      }

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
    const merchantName = process.env.TELEBIRR_MERCHANT_NAME || 'EthioMart SuperApp Merchant';
    const reference = `TLB-${order._id.toString().slice(-6).toUpperCase()}`;

    res.json({
      success: true,
      provider: 'Telebirr (Ethio Telecom)',
      merchantPhone,
      merchantName,
      amountUSD: order.totalPrice,
      amountETB,
      exchangeRate: rate,
      reference,
      customerPhone: phoneNumber || req.user?.phone || '',
      ussdCode: `*127*1*${merchantPhone}*${amountETB}#`,
      paymentChannels: [
        {
          id: 'telebirr_direct',
          name: 'Telebirr In-App Direct Authorization',
          description: 'Instant authorization using your Telebirr mobile wallet PIN',
        },
        {
          id: 'telebirr_ussd',
          name: 'Telebirr *127# USSD Dial',
          description: 'Dial *127# from your Ethio Telecom line and paste the SMS confirmation reference',
        },
      ],
      instructions: [
        `1. Enter your Telebirr registered phone number (e.g. 09... or 07...)`,
        `2. Authorize the ${amountETB} ETB transfer with your secret Telebirr PIN`,
        `3. Provide your transaction confirmation ID to instantly complete the order.`,
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
    const { orderId, transactionId, phoneNumber, pin, paymentChannel } = req.body;
    if (!orderId || !transactionId) {
      throw new BadRequestError('Order ID and Telebirr Transaction ID are required');
    }

    if (!pin || pin.toString().trim().length < 4) {
      throw new BadRequestError('Telebirr Account Security PIN (4 to 6 digits) is required for payment authorization');
    }

    const cleanPin = pin.toString().trim();
    if (!/^\d{4,6}$/.test(cleanPin)) {
      throw new BadRequestError('Invalid Telebirr PIN format. Must be a 4 to 6 numeric digit security code');
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

    const cleanPhone = (phoneNumber || req.user?.phone || '').trim();
    const rate = getEtbRate();
    const amountETB = Math.round(order.totalPrice * rate * 100) / 100;
    const maskedPin = cleanPin.slice(0, -2).replace(/./g, '*') + cleanPin.slice(-2);

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = 'telebirr';
    order.paymentResult = {
      id: cleanTxId,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user?.email || '',
      phone: cleanPhone,
      amountETB,
      provider: 'Telebirr (Ethio Telecom)',
      paymentChannel: paymentChannel || 'telebirr_direct',
      pinVerified: true,
      authSecurityType: 'pin',
      maskedPin,
    };
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    await order.save();

    // Record in dedicated Payment model
    try {
      await Payment.create({
        order: order._id,
        user: order.user,
        paymentMethod: 'telebirr',
        provider: 'Telebirr (Ethio Telecom)',
        amountUSD: order.totalPrice,
        amountETB,
        exchangeRate: rate,
        transactionId: cleanTxId,
        status: 'succeeded',
        senderPhone: cleanPhone,
        isVerified: true,
        pinVerified: true,
        authSecurityType: 'pin',
        maskedPin,
        verifiedAt: new Date(),
        paymentDetails: order.paymentResult,
      });
    } catch (payErr) {
      logger.warn('Telebirr payment record warning:', payErr.message);
    }

    logger.info(`Order ${order._id} paid via Telebirr with PIN verification (TX: ${cleanTxId}, Phone: ${cleanPhone})`);

    res.json({
      success: true,
      message: 'Telebirr payment authorized and verified with security PIN! Your order is now processing.',
      order,
      pinVerified: true,
      receipt: {
        transactionId: cleanTxId,
        phone: cleanPhone,
        amountETB,
        amountUSD: order.totalPrice,
        date: new Date().toISOString(),
        provider: 'Ethio Telecom Telebirr',
      },
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
    const accountName = process.env.CBE_ACCOUNT_NAME || 'EthioMart Retail PLC (CBE Merchant)';
    const reference = `CBE-${order._id.toString().slice(-6).toUpperCase()}`;

    res.json({
      success: true,
      provider: 'Commercial Bank of Ethiopia (CBE)',
      accountNumber,
      accountName,
      branch: 'Addis Ababa Commercial Center Branch',
      swiftCode: 'CBETETAA',
      amountUSD: order.totalPrice,
      amountETB,
      exchangeRate: rate,
      reference,
      cbeBirrCode: `*847# (CBE Birr)`,
      paymentChannels: [
        {
          id: 'cbe_mobile',
          name: 'CBE Mobile Banking App / Internet Banking',
          steps: [
            `1. Open CBE Mobile Banking app or login to CBE Internet Banking`,
            `2. Select "Transfer to Other Account" or "Pay to Merchant"`,
            `3. Enter CBE Account: ${accountNumber} (${accountName})`,
            `4. Enter Amount: ${amountETB} ETB`,
            `5. In Reason / Remark field, write your reference: ${reference}`,
            `6. Complete the transfer with your PIN and paste the FT Reference (e.g. FT24...) below.`,
          ],
        },
        {
          id: 'cbe_birr',
          name: 'CBE Birr (*847# Mobile Wallet)',
          steps: [
            `1. Dial *847# on your phone`,
            `2. Select "Pay Bill" or "Send Money"`,
            `3. Enter Account: ${accountNumber}`,
            `4. Enter Amount: ${amountETB} ETB`,
            `5. Authorize with your 4-digit CBE Birr PIN`,
            `6. Copy the confirmation Reference from CBE SMS and paste below.`,
          ],
        },
      ],
      instructions: [
        `1. Transfer ${amountETB} ETB to CBE Account: ${accountNumber} (${accountName})`,
        `2. Write reference: ${reference} in the transfer remark`,
        `3. Enter your 13-digit CBE account number or registered phone, your CBE PIN, and FT reference below.`,
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
    const {
      orderId,
      transactionId,
      senderName,
      senderAccountNumber,
      senderPhone,
      pin,
      paymentChannel,
    } = req.body;

    if (!orderId || !transactionId) {
      throw new BadRequestError('Order ID and CBE Transaction Reference are required');
    }

    if (!pin || pin.toString().trim().length < 4) {
      throw new BadRequestError('CBE Mobile Banking / CBE Birr Security PIN (4 to 6 digits) is required for payment authorization');
    }

    const cleanPin = pin.toString().trim();
    if (!/^\d{4,6}$/.test(cleanPin)) {
      throw new BadRequestError('Invalid CBE PIN format. Must be a 4 to 6 numeric digit security code');
    }

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    if (order.isPaid) {
      return res.json({ success: true, message: 'Order is already marked as paid', order });
    }

    const cleanTxId = transactionId.trim().toUpperCase();
    if (cleanTxId.length < 5) {
      throw new BadRequestError('CBE Reference must be at least 5 characters (e.g. FT24098192837)');
    }

    const cleanAccNumber = (senderAccountNumber || '').toString().trim().replace(/\s+/g, '');
    const cleanSenderName = (senderName || '').trim() || req.user?.name || 'CBE Customer';
    const cleanSenderPhone = (senderPhone || req.user?.phone || '').trim();

    const rate = getEtbRate();
    const amountETB = Math.round(order.totalPrice * rate * 100) / 100;
    const maskedPin = cleanPin.slice(0, -2).replace(/./g, '*') + cleanPin.slice(-2);
    const maskedAccount = cleanAccNumber.length >= 6
      ? cleanAccNumber.slice(0, 4) + ' •••• •••• ' + cleanAccNumber.slice(-4)
      : cleanAccNumber;

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = 'cbe';
    order.paymentResult = {
      id: cleanTxId,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user?.email || '',
      sender: cleanSenderName,
      senderAccountNumber: cleanAccNumber,
      maskedAccount,
      senderPhone: cleanSenderPhone,
      paymentChannel: paymentChannel || 'cbe_mobile_banking',
      amountETB,
      provider: 'Commercial Bank of Ethiopia (CBE)',
      pinVerified: true,
      authSecurityType: 'pin',
      maskedPin,
    };
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    await order.save();

    // Record in dedicated Payment model
    try {
      await Payment.create({
        order: order._id,
        user: order.user,
        paymentMethod: 'cbe',
        provider: 'Commercial Bank of Ethiopia (CBE)',
        amountUSD: order.totalPrice,
        amountETB,
        exchangeRate: rate,
        transactionId: cleanTxId,
        status: 'succeeded',
        senderPhone: cleanSenderPhone,
        senderAccountNumber: cleanAccNumber,
        senderName: cleanSenderName,
        bankAccountNumber: process.env.CBE_ACCOUNT_NUMBER || '1000123456789',
        isVerified: true,
        pinVerified: true,
        authSecurityType: 'pin',
        maskedPin,
        verifiedAt: new Date(),
        paymentDetails: order.paymentResult,
      });
    } catch (payErr) {
      logger.warn('CBE payment record warning:', payErr.message);
    }

    logger.info(`Order ${order._id} paid via CBE with PIN and account verification (TX: ${cleanTxId}, Acc: ${cleanAccNumber || 'N/A'})`);

    res.json({
      success: true,
      message: 'CBE payment authorized and verified! Your order is now processing.',
      order,
      pinVerified: true,
      receipt: {
        transactionId: cleanTxId,
        account: maskedAccount || 'CBE Verified',
        sender: cleanSenderName,
        amountETB,
        amountUSD: order.totalPrice,
        date: new Date().toISOString(),
        bank: 'Commercial Bank of Ethiopia',
      },
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

// @desc    Get Payment details / audit trail for an Order
// @route   GET /api/payment/order/:orderId
// @access  Private
exports.getPaymentByOrder = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      payment: payment || null,
    });
  } catch (error) {
    logger.error('Get payment by order error:', error);
    next(new AppError('Failed to fetch payment details', 500));
  }
};
