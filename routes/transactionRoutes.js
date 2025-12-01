const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

const {
  createTransaction,
  getTransactions,
  getTransactionById,
  deleteTransaction
} = require('../controllers/transactionController');

router.post('/', verifyToken, createTransaction);
router.get('/', verifyToken, getTransactions);
router.get('/:id', verifyToken, getTransactionById);
router.delete('/:id', verifyToken, deleteTransaction);

module.exports = router;
