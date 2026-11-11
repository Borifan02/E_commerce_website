const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const couponController = require('../controllers/couponController');

const router = express.Router();

router.post('/validate', couponController.validateCoupon);
router.get('/', protect, authorize('admin'), couponController.getCoupons);
router.post('/', protect, authorize('admin'), couponController.createCoupon);
router.delete('/:id', protect, authorize('admin'), couponController.deleteCoupon);

module.exports = router;
