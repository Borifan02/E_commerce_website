const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Associated order is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User making payment is required'],
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['telebirr', 'cbe', 'stripe', 'cod', 'paypal'],
      required: true,
    },
    provider: {
      type: String,
      required: true,
      default: 'Unknown Provider',
    },
    amountUSD: {
      type: Number,
      required: true,
      min: 0,
    },
    amountETB: {
      type: Number,
      required: true,
      min: 0,
    },
    exchangeRate: {
      type: Number,
      required: true,
      default: 167.0,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'succeeded',
      index: true,
    },
    senderPhone: {
      type: String,
      trim: true,
      default: '',
    },
    senderAccountNumber: {
      type: String,
      trim: true,
      default: '',
    },
    senderName: {
      type: String,
      trim: true,
      default: '',
    },
    bankAccountNumber: {
      type: String,
      trim: true,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    pinVerified: {
      type: Boolean,
      default: false,
    },
    authSecurityType: {
      type: String,
      enum: ['pin', 'otp', 'card_token', 'cod_signature', 'none'],
      default: 'pin',
    },
    maskedPin: {
      type: String,
      trim: true,
      default: '',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

