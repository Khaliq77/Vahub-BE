const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  // Ambil token dari header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // format: Bearer <token>

  if (!token) {
    return res.status(403).json({ message: 'Token tidak ditemukan' });
  }

  try {
    // Verifikasi token pakai secret di .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan data user ke req (misalnya user_id, username)
    next(); // lanjut ke route berikutnya
  } catch (error) {
    console.error('JWT verify error:', error.message);
    return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};
