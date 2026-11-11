const User = require('../models/User');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError, AppError } = require('../utils/errors');
const CONSTANTS = require('../utils/constants');

// @desc    Get all users with pagination
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      CONSTANTS.PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    next(new AppError('Failed to fetch users', 500));
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Get user by id error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('Failed to fetch user', 500));
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Enforce single-admin policy: cannot promote another user to admin if one already exists
    if (req.body.role === 'admin' && user.role !== 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists && adminExists._id.toString() !== user._id.toString()) {
        throw new BadRequestError(`Only one system administrator is allowed (${adminExists.email}). Additional administrators cannot be created.`);
      }
    }

    // Protect against removing last admin role
    if (req.body.role && req.body.role !== 'admin' && user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new BadRequestError('Cannot demote the last remaining administrator');
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        role: req.body.role || user.role,
        phone: req.body.phone !== undefined ? req.body.phone : user.phone,
        address: req.body.address !== undefined ? req.body.address : user.address,
      },
      { new: true, runValidators: true }
    ).select('-password');

    logger.info(`User updated by admin: ${updatedUser._id}`);
    res.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    logger.error('Update user error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('Failed to update user', 400));
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Cannot delete own account
    if (req.user._id.toString() === req.params.id) {
      throw new BadRequestError('You cannot delete your own admin account');
    }

    await User.findByIdAndDelete(req.params.id);

    logger.info(`User deleted: ${req.params.id}`);
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    if (error instanceof AppError) return next(error);
    next(new AppError('Failed to delete user', 500));
  }
};
