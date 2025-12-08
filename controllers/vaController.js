const pool = require("../config/db");

// CREATE
exports.createVA = async (req, res) => {
  try {
    const { institution_id, va_number, customer_name, customer_email, billing_amount, billing_type, settlement_account, description, status } = req.body;

    // Pastikan institution_id valid
    const inst = await pool.query(
      'SELECT * FROM "Institution" WHERE institution_id = $1',
      [institution_id]
    );

    if (inst.rows.length === 0)
      return res.status(400).json({ message: "Institution not found" });

    const checkVA = await pool.query(
      `SELECT * FROM "VirtualAccount" WHERE va_number = $1`,
      [va_number]
    );


    if (checkVA.rows.length > 0) {
      return res.status(400).json({ message: "VA Number sudah digunakan" });
    }

    const result = await pool.query(
      `INSERT INTO "VirtualAccount" (institution_id, va_number, customer_name, customer_email, billing_amount, billing_type, settlement_account, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [institution_id, va_number, customer_name, customer_email || null, billing_amount || 0, billing_type, settlement_account || null, description || null, status || 'success']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create VA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// READ ALL
exports.getVAs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, i.institution_name 
       FROM "VirtualAccount" v
       JOIN "Institution" i ON v.institution_id = i.institution_id
       ORDER BY v.va_id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// READ ONE
exports.getVAById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT v.*, i.institution_name 
       FROM "VirtualAccount" v
       JOIN "Institution" i ON v.institution_id = i.institution_id
       WHERE v.va_id = $1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Virtual Account not found" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateVA = async (req, res) => {
  try {
    const { id } = req.params;
    const { va_number, customer_name } = req.body;

    const result = await pool.query(
      `UPDATE "VirtualAccount"
       SET va_number=$1, customer_name=$2, 
       WHERE va_id=$3 RETURNING *`,
      [va_number, customer_name, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Virtual Account not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update VA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteVA = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "VirtualAccount" WHERE va_id = $1', [id]);
    res.json({ message: "Virtual Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
