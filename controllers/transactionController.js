const pool = require('../config/db');

// CREATE
exports.createTransaction = async (req, res) => {
  try {
    const { payment_id, reference_number, type } = req.body;

    // Pastikan payment ada
    const payment = await pool.query(
      'SELECT * FROM "Payment" WHERE payment_id = $1',
      [payment_id]
    );

    if (payment.rows.length === 0)
      return res.status(400).json({ message: 'Payment not found' });

    const result = await pool.query(
      `INSERT INTO "Transaction" (payment_id, reference_number, type)
       VALUES ($1, $2, $3) RETURNING *`,
      [payment_id, reference_number, type]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Create Transaction Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ ALL
exports.getTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.amount, p.payment_date, v.va_number
      FROM "Transaction" t
      JOIN "Payment" p ON t.payment_id = p.payment_id
      JOIN "VirtualAccount" v ON p.va_id = v.va_id
      ORDER BY t.transaction_id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// READ ONE
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*, p.amount, p.payment_date, v.va_number
       FROM "Transaction" t
       JOIN "Payment" p ON t.payment_id = p.payment_id
       JOIN "VirtualAccount" v ON p.va_id = v.va_id
       WHERE t.transaction_id = $1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Transaction not found' });

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Transaction" WHERE transaction_id = $1', [id]);

    res.json({ message: "Transaction deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
