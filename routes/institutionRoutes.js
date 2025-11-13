const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  updateInstitution,
  deleteInstitution
} = require('../controllers/institutionController');

router.post('/', verifyToken, createInstitution);
router.get('/', verifyToken, getInstitutions);
router.get('/:id', verifyToken, getInstitutionById);
router.put('/:id', verifyToken, updateInstitution);
router.delete('/:id', verifyToken, deleteInstitution);

module.exports = router;
