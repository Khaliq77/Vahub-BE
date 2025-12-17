const pool = require('../config/db');

// // CREATE
// exports.createPayment = async (req, res) => {
//   try {
//     const { va_id, amount, status } = req.body;

//     // Pastikan VA ada
//     const va = await pool.query('SELECT * FROM "VirtualAccount" WHERE va_id = $1', [va_id]);
//     if (va.rows.length === 0)
//       return res.status(400).json({ message: 'Virtual Account not found' });

//     // Tambahkan payment
//     const result = await pool.query(
//       `INSERT INTO "Payment" (va_id, amount, status)
//        VALUES ($1, $2, $3)
//        RETURNING *`,
//       [va_id, amount, status || 'SUCCESS']
//     );

//     // Update saldo VA (otomatis nambah)
//     await pool.query(
//       `UPDATE "VirtualAccount" SET balance = balance + $1 WHERE va_id = $2`,
//       [amount, va_id]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('Create Payment Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


exports.createPayment = async (req, res) => {
  const { va_id, amount, transfer_method } = req.body;

  if (!va_id || !amount || !transfer_method) {
    return res.status(400).json({
      message: 'va_id, amount, dan transfer_method wajib diisi'
    });
  }

  // mapping ke format DB
  const transferMap = {
    atm: 'ATM',
    mobile_banking: 'MOBILE_BANKING',
    branch: 'BRANCH',
    other_bank: 'OTHER_BANK',
    other_payment: 'OTHER_PAYMENT'
  };

  const mappedTransfer = transferMap[transfer_method.toLowerCase()];
  if (!mappedTransfer) {
    return res.status(400).json({
      message: 'transfer_method tidak valid'
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO "Payment"
      (va_id, amount, transfer_method, payment_time)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
      `,
      [va_id, amount, mappedTransfer]
    );

    res.status(201).json({
      message: 'Payment berhasil',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



// READ ALL
exports.getPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, v.va_number, v.customer_name
       FROM "Payment" p
       JOIN "VirtualAccount" v ON p.va_id = v.va_id
       ORDER BY p.payment_id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// READ ONE
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, v.va_number, v.customer_name
       FROM "Payment" p
       JOIN "VirtualAccount" v ON p.va_id = v.va_id
       WHERE p.payment_id = $1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Payment not found' });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE STATUS
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE "Payment"
       SET status=$1
       WHERE payment_id=$2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Payment not found' });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Payment" WHERE payment_id = $1', [id]);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
