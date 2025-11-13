const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment
} = require('../controllers/paymentController');

router.post('/', verifyToken, createPayment);
router.get('/', verifyToken, getPayments);
router.get('/:id', verifyToken, getPaymentById);
router.put('/:id', verifyToken, updatePaymentStatus);
router.delete('/:id', verifyToken, deletePayment);

module.exports = router;
