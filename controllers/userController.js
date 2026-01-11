const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const transporter = require("../utils/mailer");
const generatePassword = require("../utils/generatePassword");

// READ ALL
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "User" ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try { 
    const result = await pool.query(
      'SELECT * FROM "User" WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );  
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
