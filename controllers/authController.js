// const pool = require('../config/db');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// // LOGIN
// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const result = await pool.query(
//       'SELECT * FROM "User" WHERE username = $1',
//       [username]
//     );

//     if (result.rows.length === 0) {
//       return res.status(400).json({ message: 'Username tidak ditemukan' });
//     }

//     const user = result.rows[0];
//     const isMatch = await bcrypt.compare(password, user.password_hash);

//     if (!isMatch) {
//       return res.status(400).json({ message: 'Password salah' });
//     }

//     // Generate JWT Token
//     const token = jwt.sign(
//       { user_id: user.user_id, username: user.username, user_type: user.user_type },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.json({ message: 'Login berhasil', token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Username tidak ditemukan' });
    }

    const user = result.rows[0];

    // 🔍 Ini bagian penting
    console.log('Password input:', password);
    console.log('Hash from DB:', user.password_hash);
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Password salah' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login berhasil', token });
  } catch (error) {
    console.error('error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.register = async (req, res) => {
  const { username, password, full_name, email } = req.body;

  try {
    const existingUser = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO "User" (username, password_hash, full_name, email) VALUES ($1, $2, $3, $4)',
      [username, hashedPassword, full_name, email]
    );

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
