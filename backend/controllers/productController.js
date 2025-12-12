const Product = require('../models/Product');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError, AppError, ConflictError } = require('../utils/errors');
const CONSTANTS = require('../utils/constants');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      CONSTANTS.PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Category filter
    if (req.query.category) {
      if (!CONSTANTS.PRODUCT_CATEGORIES.includes(req.query.category)) {
        throw new BadRequestError('Invalid category');
      }
      query.category = req.query.category;
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = { $regex: req.query.brand, $options: 'i' };
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        const minPrice = parseFloat(req.query.minPrice);
        if (isNaN(minPrice) || minPrice < 0) {
          throw new BadRequestError('Invalid minimum price');
        }
        query.price.$gte = minPrice;
      }
      if (req.query.maxPrice) {
        const maxPrice = parseFloat(req.query.maxPrice);
        if (isNaN(maxPrice) || maxPrice < 0) {
          throw new BadRequestError('Invalid maximum price');
        }
        query.price.$lte = maxPrice;
      }
    }

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      const sortField = req.query.sort;
      const validSortFields = ['price', 'rating', 'createdAt', 'name'];
      if (validSortFields.includes(sortField)) {
        sort = {};
        sort[sortField] = req.query.order === 'desc' ? -1 : 1;
      }
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .select('-reviews'); // Exclude reviews for list view

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('Get products error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to fetch products', 500));
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar');

    if (!product) {
      throw new NotFoundError('Product');
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    logger.error('Get product error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to fetch product', 500));
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    // Validate category
    if (req.body.category && !CONSTANTS.PRODUCT_CATEGORIES.includes(req.body.category)) {
      throw new BadRequestError('Invalid product category');
    }

    const product = await Product.create(req.body);
    logger.info(`Product created: ${product._id}`);
    res.status(201).json({
      success: true,
      product,
      message: CONSTANTS.SUCCESS_MESSAGES.PRODUCT_CREATED,
    });
  } catch (error) {
    logger.error('Create product error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    if (error.code === 11000) {
      return next(new ConflictError('Product with this name already exists'));
    }
    next(new AppError(error.message || 'Failed to create product', 400));
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    // Validate category if provided
    if (req.body.category && !CONSTANTS.PRODUCT_CATEGORIES.includes(req.body.category)) {
      throw new BadRequestError('Invalid product category');
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new NotFoundError('Product');
    }

    logger.info(`Product updated: ${product._id}`);
    res.json({
      success: true,
      product,
      message: CONSTANTS.SUCCESS_MESSAGES.PRODUCT_UPDATED,
    });
  } catch (error) {
    logger.error('Update product error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(error.message || 'Failed to update product', 400));
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new NotFoundError('Product');
    }

    logger.info(`Product deleted: ${product._id}`);
    res.json({
      success: true,
      message: CONSTANTS.SUCCESS_MESSAGES.PRODUCT_DELETED,
    });
  } catch (error) {
    logger.error('Delete product error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to delete product', 500));
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate rating
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < CONSTANTS.VALIDATION.MIN_RATING || ratingNum > CONSTANTS.VALIDATION.MAX_RATING) {
      throw new BadRequestError(`Rating must be between ${CONSTANTS.VALIDATION.MIN_RATING} and ${CONSTANTS.VALIDATION.MAX_RATING}`);
    }

    // Validate comment
    if (!comment || comment.trim().length < CONSTANTS.VALIDATION.MIN_COMMENT_LENGTH) {
      throw new BadRequestError(`Comment must be at least ${CONSTANTS.VALIDATION.MIN_COMMENT_LENGTH} characters`);
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      throw new ConflictError('You have already reviewed this product');
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: ratingNum,
      comment: comment.trim(),
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    logger.info(`Review added for product: ${product._id}`);
    res.status(201).json({
      success: true,
      message: CONSTANTS.SUCCESS_MESSAGES.REVIEW_ADDED,
    });
  } catch (error) {
    logger.error('Create review error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(error.message || 'Failed to create review', 400));
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ isActive: true })
      .sort({ rating: -1, numReviews: -1 })
      .limit(limit)
      .select('-reviews');

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    logger.error('Get featured products error:', error);
    next(new AppError('Failed to fetch featured products', 500));
  }
};
