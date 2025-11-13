const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createVA,
  getVAs,
  getVAById,
  updateVA,
  deleteVA
} = require('../controllers/vaController');

// Semua route VA dilindungi JWT
router.post('/', verifyToken, createVA);
router.get('/', verifyToken, getVAs);
router.get('/:id', verifyToken, getVAById);
router.put('/:id', verifyToken, updateVA);
router.delete('/:id', verifyToken, deleteVA);

module.exports = router;