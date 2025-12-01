const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

const {
  generateSettlement,
  getSettlements,
  getSettlementById,
  updateSettlementStatus,
  deleteSettlement
} = require('../controllers/settlementController');

router.post('/generate', verifyToken, generateSettlement);
router.get('/', verifyToken, getSettlements);
router.get('/:id', verifyToken, getSettlementById);
router.put('/:id', verifyToken, updateSettlementStatus);
router.delete('/:id', verifyToken, deleteSettlement);

module.exports = router;
