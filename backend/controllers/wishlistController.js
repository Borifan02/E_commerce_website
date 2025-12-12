const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError, AppError, ConflictError } = require('../utils/errors');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products.product', 'name price images rating stock isActive');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Filter out inactive products
    wishlist.products = wishlist.products.filter(
      (item) => item.product && item.product.isActive !== false
    );

    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    logger.error('Get wishlist error:', error);
    next(new AppError('Failed to fetch wishlist', 500));
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    if (!product.isActive) {
      throw new BadRequestError('Cannot add inactive product to wishlist');
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const exists = wishlist.products.find(
      (item) => item.product.toString() === productId
    );

    if (exists) {
      throw new ConflictError('Product already in wishlist');
    }

    wishlist.products.push({ product: productId });
    await wishlist.save();

    wishlist = await wishlist.populate('products.product', 'name price images rating stock');
    logger.info(`Product added to wishlist: ${productId}`);
    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    logger.error('Add to wishlist error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to add product to wishlist', 500));
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      throw new NotFoundError('Wishlist');
    }

    const productExists = wishlist.products.find(
      (item) => item.product.toString() === productId
    );

    if (!productExists) {
      throw new NotFoundError('Product in wishlist');
    }

    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();
    logger.info(`Product removed from wishlist: ${productId}`);
    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to remove product from wishlist', 500));
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      throw new NotFoundError('Wishlist');
    }

    wishlist.products = [];
    await wishlist.save();

    logger.info(`Wishlist cleared for user: ${req.user._id}`);
    res.json({
      success: true,
      message: 'Wishlist cleared',
    });
  } catch (error) {
    logger.error('Clear wishlist error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to clear wishlist', 500));
  }
};
