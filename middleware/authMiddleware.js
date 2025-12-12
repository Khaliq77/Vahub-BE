const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.verifyToken = async (req, res, next) => {
  // Ambil token dari header Authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // format: Bearer <token>

  if (!token) {
    return res.status(403).json({ message: "Token tidak ditemukan" });
  }

  try {
    // Verifikasi token pakai secret di .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan data user ke req (misalnya user_id, username)
    // Pastikan token punya username
    if (!decoded.username) {
      return res.status(400).json({ message: "Username tidak ada di token" });
    }

    // Ambil client_id berdasarkan username
    const result = await pool.query(
      `SELECT client_id FROM "Client" WHERE username = $1`,
      [decoded.username]
    );

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Client ID tidak ditemukan untuk username ini" });
    }

    // Simpan client_id untuk digunakan controller VA
    req.client_id = result.rows[0].client_id;

    next(); // lanjut ke route berikutnya
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return res
      .status(401)
      .json({ message: "Token tidak valid atau kadaluarsa" });
  }
};
