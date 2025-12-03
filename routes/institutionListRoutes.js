const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getInstitutionList
} = require('../controllers/institutionListController');

router.get('/', verifyToken, getInstitutionList);

module.exports = router;