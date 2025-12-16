const pool = require("../config/db");

// CREATE
exports.createVA = async (req, res) => {
  const client_id = req.body.client_id;
  const data = req.body.data; // ARRAY

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: "Data VA kosong" });
  }

  try {
    const results = [];

    for (const item of data) {
      const {
        va_number,
        customer_name,
        customer_email,
        billing_amount,
        billing_type,
        settlement_account,
        description,
      } = item;

      // 🔐 VALIDASI WAJIB
      if (!va_number || !customer_name || !billing_amount || !billing_type) {
        return res.status(400).json({
          message: "Field wajib tidak lengkap",
          item,
        });
      }

      if (!client_id) {
        return res
          .status(400)
          .json({ message: "Client ID not found in token" });
      }

      // Memastikan client_id valid
      const inst = await pool.query(
        'SELECT * FROM "Client" WHERE client_id = $1',
        [client_id]
      );

      if (inst.rows.length === 0)
        return res.status(400).json({ message: "Client not found" });

      const checkVA = await pool.query(
        `SELECT * FROM "VirtualAccount" WHERE va_number = $1`,
        [va_number]
      );

      if (checkVA.rows.length > 0) {
        return res.status(400).json({ message: "VA Number sudah digunakan" });
      }

      const result = await pool.query(
        `
        INSERT INTO "VirtualAccount" (
          client_id,
          va_number,
          customer_name,
          customer_email,
          billing_amount,
          billing_type,
          settlement_account,
          description,
          status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'success')
        RETURNING *
        `,
        [
          client_id,
          va_number,
          customer_name,
          customer_email,
          billing_amount,
          billing_type,
          settlement_account,
          description,
        ]
      );

      results.push(result.rows[0]);
    }

    res.status(201).json({
      message: "VA berhasil dibuat",
      total: results.length,
      data: results,
    });
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
       JOIN "Client" i ON v.client_id = i.client_id
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
       JOIN "Client" i ON v.client_id = i.client_id
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
       SET va_number=$1, customer_name=$2
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
