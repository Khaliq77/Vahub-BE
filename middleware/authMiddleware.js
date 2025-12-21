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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // 🔑 ADMIN: langsung lolos
    if (decoded.user_type === "admin") {
      req.client_id = null;
      return next();
    }

    // 🔑 CLIENT: WAJIB punya client_id
    if (decoded.user_type === "client") {
      if (!decoded.client_id) {
        return res
          .status(403)
          .json({ message: "Client ID tidak ditemukan di token" });
      }

      req.client_id = decoded.client_id;
      return next();
    }

    return res.status(403).json({ message: "User type tidak dikenali" });
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return res
      .status(401)
      .json({ message: "Token tidak valid atau kadaluarsa" });
  }
};
