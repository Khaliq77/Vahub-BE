const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');

router.get('/', verifyToken, getClients);
router.get('/:id', verifyToken, getClientById);
router.put('/:id', verifyToken, updateClient);
router.delete('/:id', verifyToken, deleteClient);

module.exports = router;
