const pool = require("../config/db");

// READ ALL
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "User" ORDER BY user_id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};