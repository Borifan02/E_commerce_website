const express = require('express');
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Stripe / Card
router.post('/create-payment-intent', protect, paymentController.createPaymentIntent);
router.post('/confirm', protect, paymentController.confirmPayment);
router.get('/config', paymentController.getConfig);
router.get('/rates', paymentController.getRates);

// Local Payment Integration (Ethiopia)
// Telebirr
router.post('/telebirr/initiate', protect, paymentController.initiateTelebirr);
router.post('/telebirr/verify', protect, paymentController.verifyTelebirr);

// Commercial Bank of Ethiopia (CBE / CBE Birr)
router.post('/cbe/initiate', protect, paymentController.initiateCBE);
router.post('/cbe/verify', protect, paymentController.verifyCBE);

module.exports = router;
