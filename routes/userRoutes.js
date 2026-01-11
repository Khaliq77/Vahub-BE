const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getUsers,
  getUserByUsername,
} = require('../controllers/userController');

router.get('/', verifyToken, getUsers);
router.get('/:username', verifyToken, getUserByUsername);

module.exports = router;