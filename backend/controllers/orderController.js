const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation } = require('../utils/emailService');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError, AppError, ForbiddenError } = require('../utils/errors');
const CONSTANTS = require('../utils/constants');

// Helper function to check if error is transaction-related
const isTransactionError = (error) => {
  return error?.code === 20 || 
         error?.codeName === 'IllegalOperation' ||
         (error?.message && error.message.includes('Transaction numbers are only allowed'));
};

// Helper function to create order without transactions
const createOrderWithoutTransaction = async (req, orderItemsWithDetails, itemsPrice, productUpdates) => {
  const {
    shippingAddress,
    paymentMethod,
  } = req.body;

  // Calculate tax and shipping
  const taxPrice = itemsPrice * CONSTANTS.TAX.RATE;
  const shippingPrice = itemsPrice > CONSTANTS.SHIPPING.FREE_THRESHOLD 
    ? 0 
    : CONSTANTS.SHIPPING.STANDARD_COST;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    orderItems: orderItemsWithDetails,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
  });

  // Update product stock
  for (const update of productUpdates) {
    await Product.findByIdAndUpdate(
      update.productId,
      { $inc: { stock: -update.quantity } },
      { new: true }
    );
  }

  return order;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  let session = null;
  let useSession = false;

  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      throw new BadRequestError('No order items');
    }

    // Verify stock availability, calculate prices, and prepare order items
    let itemsPrice = 0;
    const orderItemsWithDetails = [];
    const productUpdates = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new NotFoundError(`Product ${item.name || item.product}`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`
        );
      }

      const orderItem = {
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
      };

      orderItemsWithDetails.push(orderItem);
      itemsPrice += product.price * item.quantity;
      productUpdates.push({
        productId: product._id,
        quantity: item.quantity,
      });
    }

    // Try to use transactions if available
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useSession = true;

      // Calculate tax and shipping
      const taxPrice = itemsPrice * CONSTANTS.TAX.RATE;
      const shippingPrice = itemsPrice > CONSTANTS.SHIPPING.FREE_THRESHOLD 
        ? 0 
        : CONSTANTS.SHIPPING.STANDARD_COST;

      // Create order within transaction
      const order = await Order.create([{
        user: req.user._id,
        orderItems: orderItemsWithDetails,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
      }], { session });

      // Update product stock within transaction
      for (const update of productUpdates) {
        await Product.findByIdAndUpdate(
          update.productId,
          { $inc: { stock: -update.quantity } },
          { session, new: true }
        );
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      const createdOrder = order[0];

      // Send order confirmation email (outside transaction - non-critical)
      try {
        await sendOrderConfirmation(createdOrder, req.user.email);
      } catch (emailError) {
        logger.error('Order confirmation email error:', emailError);
        // Don't fail the request if email fails
      }

      logger.info(`Order created: ${createdOrder._id}`);
      return res.status(201).json({
        success: true,
        order: createdOrder,
      });
    } catch (transactionError) {
      // If transaction error, clean up and retry without transactions
      if (useSession && session) {
        try {
          await session.abortTransaction();
        } catch (e) {
          // Ignore abort errors
        }
        try {
          session.endSession();
        } catch (e) {
          // Ignore end session errors
        }
      }

      // If it's a transaction error, retry without transactions
      if (isTransactionError(transactionError)) {
        logger.warn('Transactions not supported, creating order without transaction');
        const order = await createOrderWithoutTransaction(req, orderItemsWithDetails, itemsPrice, productUpdates);

        // Send order confirmation email
        try {
          await sendOrderConfirmation(order, req.user.email);
        } catch (emailError) {
          logger.error('Order confirmation email error:', emailError);
        }

        logger.info(`Order created (no transaction): ${order._id}`);
        return res.status(201).json({
          success: true,
          order,
        });
      }

      // If it's not a transaction error, re-throw it
      throw transactionError;
    }
  } catch (error) {
    logger.error('Create order error:', error);
    
    // If it's already an AppError, pass it to error handler
    if (error instanceof AppError) {
      return next(error);
    }
    
    // Otherwise, create a generic error
    next(new AppError(error.message || 'Failed to create order', 500));
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || CONSTANTS.PAGINATION.DEFAULT_ORDER_LIMIT;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('orderItems.product', 'name images');

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('Get user orders error:', error);
    next(new AppError('Failed to fetch orders', 500));
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to view this order');
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    logger.error('Get order error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to fetch order', 500));
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to update this order');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };
    order.status = CONSTANTS.ORDER_STATUS.PROCESSING;

    const updatedOrder = await order.save();
    logger.info(`Order paid: ${order._id}`);
    res.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    logger.error('Update order to paid error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to update order payment', 500));
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || CONSTANTS.PAGINATION.DEFAULT_ORDER_LIMIT;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('Get all orders error:', error);
    next(new AppError('Failed to fetch orders', 500));
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Validate status
    const validStatuses = Object.values(CONSTANTS.ORDER_STATUS);
    if (!validStatuses.includes(req.body.status)) {
      throw new BadRequestError('Invalid order status');
    }

    order.status = req.body.status;
    
    if (req.body.status === CONSTANTS.ORDER_STATUS.DELIVERED) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    if (req.body.notes) {
      order.notes = req.body.notes;
    }

    const updatedOrder = await order.save();
    logger.info(`Order status updated: ${order._id} - ${req.body.status}`);
    res.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to update order status', 500));
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to cancel this order');
    }

    if (order.status === CONSTANTS.ORDER_STATUS.DELIVERED || 
        order.status === CONSTANTS.ORDER_STATUS.SHIPPED) {
      throw new BadRequestError('Cannot cancel shipped or delivered orders');
    }

    // Try to use transactions if available
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const orderWithSession = await Order.findById(req.params.id).session(session);
      orderWithSession.status = CONSTANTS.ORDER_STATUS.CANCELLED;

      // Restore product stock within transaction
      for (const item of orderWithSession.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session, new: true }
        );
      }

      await orderWithSession.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      logger.info(`Order cancelled: ${orderWithSession._id}`);
      return res.json({
        success: true,
        message: 'Order cancelled successfully',
        order: orderWithSession,
      });
    } catch (transactionError) {
      // If transaction error, retry without transactions
      if (isTransactionError(transactionError)) {
        logger.warn('Transactions not supported, cancelling order without transaction');
        
        order.status = CONSTANTS.ORDER_STATUS.CANCELLED;

        // Restore product stock
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { new: true }
          );
        }

        const updatedOrder = await order.save();

        logger.info(`Order cancelled (no transaction): ${updatedOrder._id}`);
        return res.json({
          success: true,
          message: 'Order cancelled successfully',
          order: updatedOrder,
        });
      }

      // If it's not a transaction error, re-throw it
      throw transactionError;
    }
  } catch (error) {
    logger.error('Cancel order error:', error);
    
    if (error instanceof AppError) {
      return next(error);
    }
    
    next(new AppError(error.message || 'Failed to cancel order', 500));
  }
};
