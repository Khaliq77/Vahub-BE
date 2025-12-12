const pool = require("../config/db");

// exports.createInstitution = async (req, res) => {
//   try {
//     const {
//       institution_code,
//       institution_name,
//       client_name,
//       login_id,
//       email,
//       backend_service,
//     } = req.body;

//     // Cek duplicate institution
//     const check = await pool.query(
//       `SELECT institution_id FROM "Institution" WHERE institution_name = $1`,
//       [institution_name]
//     );

//     if (check.rows.length > 0) {
//       return res.status(400).json({ message: "Institution sudah terdaftar" });
//     }

//     const result = await pool.query(
//       `INSERT INTO "Institution" (institution_code,institution_name, client_name, login_id, email, backend_service)
//        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//       [
//         institution_code,
//         institution_name,
//         client_name,
//         login_id,
//         email,
//         backend_service,
//       ]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error("Create institution error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// READ ALL
exports.getClients = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "Client" ORDER BY client_id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// READ ONE
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM "Client" WHERE client_id = $1',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Client not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_name, email, backend_service } = req.body;
    const result = await pool.query(
      `UPDATE "Client"
       SET client_name=$1, email=$2, backend_service=$3
       WHERE client_id=$4 RETURNING *`,
      [client_name, email, backend_service, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Client not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Client" WHERE client_id = $1', [
      id,
    ]);
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
