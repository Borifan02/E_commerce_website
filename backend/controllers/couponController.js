const Coupon = require('../models/Coupon');
const logger = require('../utils/logger');
const { BadRequestError, NotFoundError, ConflictError, AppError } = require('../utils/errors');

// @desc    Validate and apply coupon code
// @route   POST /api/coupons/validate
// @access  Public / Protected
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    if (!code) {
      throw new BadRequestError('Please provide a coupon code');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      throw new NotFoundError('Coupon code');
    }

    const check = coupon.isValid(orderAmount);
    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.message,
      });
    }

    const discount = coupon.calculateDiscount(orderAmount);

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        discount,
      },
      message: `Coupon applied! You save $${discount.toFixed(2)}`,
    });
  } catch (error) {
    logger.error('Validate coupon error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('Failed to validate coupon', 500));
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    logger.error('Get coupons error:', error);
    next(new AppError('Failed to fetch coupons', 500));
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const exists = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (exists) {
      throw new ConflictError('A coupon with this code already exists');
    }

    const coupon = await Coupon.create({
      ...req.body,
      code: code.toUpperCase().trim(),
    });

    logger.info(`Coupon created: ${coupon.code}`);
    res.status(201).json({
      success: true,
      coupon,
      message: 'Coupon created successfully',
    });
  } catch (error) {
    logger.error('Create coupon error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError(error.message || 'Failed to create coupon', 400));
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      throw new NotFoundError('Coupon');
    }

    logger.info(`Coupon deleted: ${coupon.code}`);
    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    logger.error('Delete coupon error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('Failed to delete coupon', 500));
  }
};
