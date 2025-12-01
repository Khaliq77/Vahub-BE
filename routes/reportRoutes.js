const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

const {
  getSummary,
  getTransactionDaily,
  getPaymentAmountDaily,
  getPaymentByInstitution
} = require('../controllers/reportController');

router.get('/summary', verifyToken, getSummary);
router.get('/transaction/daily', verifyToken, getTransactionDaily);
router.get('/payment/amount-daily', verifyToken, getPaymentAmountDaily);
router.get('/payment/by-institution', verifyToken, getPaymentByInstitution);

module.exports = router;
