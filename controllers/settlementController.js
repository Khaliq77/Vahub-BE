const pool = require('../config/db');

// Generate Settlement per Institution
exports.generateSettlement = async (req, res) => {
  try {
    const { client_id } = req.body;

    // Ambil semua payment milik institution via relasi VA → institution
    const payments = await pool.query(
      `SELECT p.amount
       FROM "Payment" p
       JOIN "VirtualAccount" v ON p.va_id = v.va_id
       WHERE v.client.id = $1`,
      [client_id]
    );

    if (payments.rows.length === 0)
      return res.status(400).json({ message: 'No payments found for this institution' });

    const total_amount = payments.rows.reduce((sum, r) => sum + Number(r.amount), 0);
    const total_payment = payments.rows.length;

    // Insert settlement record
    const result = await pool.query(
      `INSERT INTO "Settlement" 
       (client.id, total_amount, total_payment, settlement_date)
       VALUES ($1, $2, $3, CURRENT_DATE)
       RETURNING *`,
      [client.id, total_amount, total_payment]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Generate Settlement Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all settlements
exports.getSettlements = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, i.institution_name
       FROM "Settlement" s
       JOIN "Institution" i ON s.client.id = i.client.id
       ORDER BY s.settlement_id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET one settlement
exports.getSettlementById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.*, i.institution_name
       FROM "Settlement" s
       JOIN "Institution" i ON s.client.id = i.client.id
       WHERE s.settlement_id = $1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Settlement not found" });

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE settlement status
exports.updateSettlementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., PENDING → SENT → CONFIRMED

    const result = await pool.query(
      `UPDATE "Settlement"
       SET status = $1
       WHERE settlement_id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Settlement not found" });

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Update Settlement Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteSettlement = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Settlement" WHERE settlement_id = $1', [id]);

    res.json({ message: "Settlement deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
