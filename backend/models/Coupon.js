const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  discountAmount: {
    type: Number,
    required: [true, 'Please provide discount amount'],
    min: [0, 'Discount amount cannot be negative'],
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative'],
  },
  maxDiscount: {
    type: Number,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null,
  },
  timesUsed: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

couponSchema.methods.isValid = function(orderAmount = 0) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (this.expiresAt && new Date() > this.expiresAt) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.timesUsed >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of $${this.minOrderAmount.toFixed(2)} required for this coupon`,
    };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountAmount) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = Math.min(this.discountAmount, orderAmount);
  }
  return Math.round(discount * 100) / 100;
};

module.exports = mongoose.model('Coupon', couponSchema);
