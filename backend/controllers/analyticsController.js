const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    const populatedTopProducts = await Product.populate(topProducts, { path: '_id' });

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      topProducts: populatedTopProducts,
      ordersByStatus,
      monthlyRevenue
    });
  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get sales report
// @route   GET /api/analytics/sales
// @access  Private/Admin
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const match = { isPaid: true };
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const salesData = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalSales: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    logger.error('Get sales report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
