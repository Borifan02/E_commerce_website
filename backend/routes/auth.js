const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

const validateProfile = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Auth routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Current user profile routes
router.get('/me', protect, authController.getProfile);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validateProfile, authController.updateProfile);

// Password management routes
router.put('/updatepassword', protect, authController.updatePassword);
router.put('/update-password', protect, authController.updatePassword);
router.post('/forgotpassword', authController.forgotPassword);
router.post('/forgot-password', authController.forgotPassword);
router.put('/resetpassword/:resetToken', authController.resetPassword);
router.put('/reset-password/:resetToken', authController.resetPassword);

module.exports = router;
