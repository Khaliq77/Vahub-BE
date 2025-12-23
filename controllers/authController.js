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

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const transporter = require("../utils/mailer");
const generatePassword = require("../utils/generatePassword");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Username tidak ditemukan" });
    }

    const user = result.rows[0];

    // 🔍 Ini bagian penting
    console.log("Password input:", password);
    console.log("Hash from DB:", user.password_hash);
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    // 🔥 Ambil client_id dari tabel Client berdasarkan username
    const clientData = await pool.query(
      `SELECT client_id FROM "Client" WHERE username = $1`,
      [username]
    );

    const client_id = clientData.rows[0]?.client_id || null;

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        user_type: user.user_type,
        client_id: client_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        user_type: user.user_type,
        user_status: user.status,
      },
    });
  } catch (error) {
    console.error("error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  const {
    username,
    client_name,
    email,
    institution_code,
    institution_name,
    backend_service,
  } = req.body;

  const user_type = "client";
  const status = 0;

  try {
    const existingUser = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Username sudah terdaftar" });
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await pool.query(
      'INSERT INTO "User" (username, password_hash, client_name, email, user_type, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [username, hashedPassword, client_name, email, user_type, status]
    );

    await pool.query(
      'INSERT INTO "Client" (username, client_name, email, institution_name, institution_code, backend_service) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        username,
        client_name,
        email,
        institution_name,
        institution_code,
        backend_service,
      ]
    );

    await transporter.sendMail({
      from: `"VAHUB Admin" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Username dan Password Akun VAHUB",
      html: `
        <h3>Akun VAHUB Berhasil Dibuat</h3>
        <p><b>Username:</b> ${username}</p>
        <p><b>Password:</b> ${plainPassword}</p>
        <p>Silakan login dan segera ganti password Anda.</p>
      `,
    });

    res.status(201).json({ message: "Client berhasil dibuat & email terkirim" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.activateAccount = async (req, res) => {
//   const { username, user_id, new_password } = req.body;

//   // Ambil user berdasarkan username
//   const result = await pool.query(
//     'SELECT * FROM "User" WHERE username = $1',
//     [username]
//   );


//   try {
//     // Hash password baru
//     const hashedNewPassword = await bcrypt.hash(new_password, 10);

//     // Update password & status = 1
//     await pool.query(
//       `UPDATE "User"
//        SET password_hash = $1,
//            status = 1
//        WHERE user_id = $2`,
//       [hashedNewPassword, user_id]
//     );

//     return res.status(200).json({ message: "Akun berhasil diaktifkan" });
//   } catch (error) {
//     console.error("activateAccount error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.activateAccount = async (req, res) => {
  const { username, new_password } = req.body;

  if (!username || !new_password) {
    return res.status(400).json({ message: "Username dan password wajib diisi" });
  }

  try {
    // Cek user
    const result = await pool.query(
      'SELECT user_id, status FROM "User" WHERE username = $1',
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const user = result.rows[0];

    if (user.status === 1) {
      return res.status(400).json({ message: "Akun sudah aktif" });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password & status
    await pool.query(
      `UPDATE "User"
       SET password_hash = $1,
           status = 1
       WHERE user_id = $2`,
      [hashedPassword, user.user_id]
    );

    return res.status(200).json({
      message: "Akun berhasil diaktifkan"
    });
  } catch (error) {
    console.error("activateAccount error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.changePassword = async (req, res) => {
  const { username, old_password, new_password } = req.body;

  try {
    // Ambil user berdasarkan username
    const result = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const user = result.rows[0];

    // Cek password lama cocok
    const passwordMatch = await bcrypt.compare(
      old_password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(400).json({ message: "Password lama salah" });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Update password & status = 1
    await pool.query(
      `UPDATE "User"
       SET password_hash = $1,
           status = 1
       WHERE username = $2`,
      [hashedNewPassword, username]
    );

    return res.status(200).json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//   await pool.query(
//     'UPDATE INTO '
//     'INSERT INTO "User" (username, password_hash, client_name, email, user_type, status) VALUES ($1, $2, $3, $4, $5, $6)',
//     [username, hashedPassword, client_name, email, user_type, status]
//   );
// } catch (error) {
//   console.error("Register error:", error);
//   res.status(500).json({ message: "Server error" });
// }
