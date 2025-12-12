const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendWelcomeEmail, sendPasswordReset } = require('../utils/emailService');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError, AppError, ConflictError, UnauthorizedError } = require('../utils/errors');
const CONSTANTS = require('../utils/constants');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate password length
    if (!password || password.length < CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH) {
      throw new BadRequestError(
        `Password must be at least ${CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters`
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ConflictError(CONSTANTS.ERROR_MESSAGES.USER_EXISTS);
    }

    const user = await User.create({ name, email, password });

    // Send welcome email (non-critical)
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      logger.error('Welcome email error:', emailError);
      // Don't fail registration if email fails
    }

    const token = generateToken(user._id);

    logger.info(`User registered: ${user.email}`);
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    logger.error('Register error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    if (error.code === 11000) {
      return next(new ConflictError(CONSTANTS.ERROR_MESSAGES.USER_EXISTS));
    }
    next(new AppError(error.message || 'Registration failed', 400));
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError(CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError(CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const token = generateToken(user._id);

    logger.info(`User logged in: ${user.email}`);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    logger.error('Login error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Login failed', 500));
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to fetch profile', 500));
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Update fields
    if (req.body.name) {
      if (req.body.name.length < CONSTANTS.VALIDATION.MIN_NAME_LENGTH) {
        throw new BadRequestError(`Name must be at least ${CONSTANTS.VALIDATION.MIN_NAME_LENGTH} characters`);
      }
      user.name = req.body.name;
    }

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
      user.email = req.body.email;
    }

    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    if (req.body.address !== undefined) {
      user.address = req.body.address;
    }

    if (req.body.password) {
      if (req.body.password.length < CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH) {
        throw new BadRequestError(
          `Password must be at least ${CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters`
        );
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    logger.info(`Profile updated: ${user.email}`);
    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
      },
      message: CONSTANTS.SUCCESS_MESSAGES.PROFILE_UPDATED,
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    if (error.code === 11000) {
      return next(new ConflictError('Email already in use'));
    }
    next(new AppError(error.message || 'Failed to update profile', 400));
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Please provide an email address');
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      // But still return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + CONSTANTS.TIME.ONE_HOUR;

    await user.save();

    try {
      await sendPasswordReset(user.email, resetToken);
      res.json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (emailError) {
      // Rollback token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      logger.error('Password reset email error:', emailError);
      throw new AppError('Email could not be sent. Please try again later.', 500);
    }
  } catch (error) {
    logger.error('Forgot password error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to process password reset request', 500));
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH) {
      throw new BadRequestError(
        `Password must be at least ${CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters`
      );
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError(CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    logger.info(`Password reset: ${user.email}`);
    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to reset password', 500));
  }
};
