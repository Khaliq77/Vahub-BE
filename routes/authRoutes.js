const express = require('express');
const router = express.Router();
const { login, register, activateAccount, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware'); // import middleware

module.exports = router;
// route login & register
router.post('/login', login);
router.post('/register', register);

router.post('/activate', verifyToken, activateAccount);
router.post('/changepassword', verifyToken, changePassword);

// route test JWT
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: `Halo ${req.user.username}!`,
    user_id: req.user.user_id,
    info: 'Ini data hanya bisa diakses jika token valid.'
  });
});