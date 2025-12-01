const pool = require('../config/db');

// SUMMARY DASHBOARD
exports.getSummary = async (req, res) => {
  try {
    const total_institution = (await pool.query(`SELECT COUNT(*) FROM "Institution"`)).rows[0].count;
    const total_va = (await pool.query(`SELECT COUNT(*) FROM "VirtualAccount"`)).rows[0].count;
    const total_payment = (await pool.query(`SELECT COUNT(*) FROM "Payment"`)).rows[0].count;
    const total_transaction = (await pool.query(`SELECT COUNT(*) FROM "Transaction"`)).rows[0].count;

    const total_settlement_amount = (await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total FROM "Settlement"
    `)).rows[0].total;

    res.json({
      total_institution,
      total_va,
      total_payment,
      total_transaction,
      total_settlement_amount
    });

  } catch (error) {
    console.error("Summary Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// TRANSACTION DAILY GRAPH (LAST 7 DAYS)
exports.getTransactionDaily = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS count
      FROM "Transaction"
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Transaction Daily Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// PAYMENT AMOUNT DAILY
exports.getPaymentAmountDaily = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(payment_date) AS date,
        SUM(amount) AS total_amount
      FROM "Payment"
      WHERE payment_date >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(payment_date)
      ORDER BY date ASC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Payment Amount Daily Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// PAYMENT BY INSTITUTION
exports.getPaymentByInstitution = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.institution_name,
        COUNT(p.payment_id) AS total_payment,
        SUM(p.amount) AS total_amount
      FROM "Institution" i
      LEFT JOIN "VirtualAccount" v ON v.institution_id = i.institution_id
      LEFT JOIN "Payment" p ON p.va_id = v.va_id
      GROUP BY i.institution_id
      ORDER BY total_amount DESC NULLS LAST
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Payment by Institution Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
