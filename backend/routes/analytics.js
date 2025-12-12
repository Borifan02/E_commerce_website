const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardAnalytics,
  getSalesReport
} = require('../controllers/analyticsController');

router.get('/dashboard', protect, authorize('admin'), getDashboardAnalytics);
router.get('/sales', protect, authorize('admin'), getSalesReport);

module.exports = router;
