const pool = require("../config/db");

// CREATE
// exports.createInstitution = async (req, res) => {
//   try {
//     const {institution_code, institution_name, address, email, phone } = req.body;
//     const result = await pool.query(
//       `INSERT INTO "Institution" (institution_name, address, email, phone)
//        VALUES ($1, $2, $3, $4) RETURNING *`,
//       [institution_name, address, email, phone]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('Create institution error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.createInstitution = async (req, res) => {
  try {
    const {
      institution_code,
      institution_name,
      client_name,
      login_id,
      email,
      backend_service,
    } = req.body;

    // Cek duplicate institution
    const check = await pool.query(
      `SELECT client.id FROM "Institution" WHERE institution_name = $1`,
      [institution_name]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Institution sudah terdaftar" });
    }

    const result = await pool.query(
      `INSERT INTO "Institution" (institution_code,institution_name, client_name, login_id, email, backend_service)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        institution_code,
        institution_name,
        client_name,
        login_id,
        email,
        backend_service,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create institution error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// READ ALL
exports.getInstitutions = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "Institution" ORDER BY client.id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// READ ONE
exports.getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM "Institution" WHERE client.id = $1',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Institution not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { institution_name, address, email, phone } = req.body;
    const result = await pool.query(
      `UPDATE "Institution"
       SET institution_name=$1, address=$2, email=$3, phone=$4
       WHERE client.id=$5 RETURNING *`,
      [institution_name, address, email, phone, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Institution not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Institution" WHERE client.id = $1', [
      id,
    ]);
    res.json({ message: "Institution deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
