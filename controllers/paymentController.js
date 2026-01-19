const pool = require("../config/db");

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

// exports.createPayment = async (req, res) => {
//   const { va_id, amount, transfer_method } = req.body;

//   if (!va_id || !amount || !transfer_method) {
//     return res.status(400).json({
//       message: 'va_id, amount, dan transfer_method wajib diisi'
//     });
//   }

//   // mapping ke format DB
//   const transferMap = {
//     atm: 'ATM',
//     mobile_banking: 'MOBILE_BANKING',
//     branch: 'BRANCH',
//     other_bank: 'OTHER_BANK',
//     other_payment: 'OTHER_PAYMENT'
//   };

//   const mappedTransfer = transferMap[transfer_method.toLowerCase()];
//   if (!mappedTransfer) {
//     return res.status(400).json({
//       message: 'transfer_method tidak valid'
//     });
//   }

//   try {
//     const result = await pool.query(
//       `
//       INSERT INTO "Payment"
//       (va_id, amount, transfer_method, payment_date)
//       VALUES ($1, $2, $3, NOW())
//       RETURNING *
//       `,
//       [va_id, amount, mappedTransfer]
//     );

//     res.status(201).json({
//       message: 'Payment berhasil',
//       data: result.rows[0]
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.createPayment = async (req, res) => {
  const { va_id, amount, transfer_method } = req.body;

  if (!va_id || !amount || !transfer_method) {
    return res.status(400).json({
      message: "va_id, amount, dan transfer_method wajib diisi",
    });
  }

  // Mapping transfer method
  const transferMap = {
    atm: "ATM",
    mobile_banking: "MOBILE_BANKING",
    branch: "BRANCH",
    other_bank: "OTHER_BANK",
    other_payment: "OTHER_PAYMENT",
  };

  const mappedTransfer = transferMap[transfer_method.toLowerCase()];
  if (!mappedTransfer) {
    return res.status(400).json({
      message: "transfer_method tidak valid",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔍 Ambil VA
    const vaResult = await client.query(
      `SELECT * FROM "VirtualAccount" WHERE va_id = $1`,
      [va_id]
    );

    if (vaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Virtual Account not found" });
    }

    const va = vaResult.rows[0];

    // ❌ Cegah double payment
    if (va.payment_status === "paid") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Virtual Account sudah dibayar",
      });
    }

    // ❌ Cegah bayar VA expired
    if (va.expired_at && new Date(va.expired_at) < new Date()) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Virtual Account sudah expired",
      });
    }

    // ✅ Insert Payment
    const paymentResult = await client.query(
      `
      INSERT INTO "Payment"
      (va_id, amount, transfer_method, payment_date, status)
      VALUES ($1, $2, $3, NOW(), 'SUCCESS')
      RETURNING *
      `,
      [va_id, amount, mappedTransfer]
    );

    // ✅ Update VA → PAID
    await client.query(
      `
      UPDATE "VirtualAccount"
      SET
        payment_status = 'paid',
        status = 'expired'
      WHERE va_id = $1
      `,
      [va_id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Payment berhasil",
      data: paymentResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create Payment Error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// READ ALL
exports.retrievePaymentPeriod = async (req, res) => {
  const { start_date, end_date } = req.body;

  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ message: "start_date dan end_date wajib diisi" });
  }

  try {
    const result = await pool.query(
      `SELECT p.*
       FROM "Payment" p
       WHERE p.payment_date BETWEEN
             $1::date
             AND ($2::date + INTERVAL '1 day' - INTERVAL '1 second')
       ORDER BY p.payment_id DESC`,
      [start_date, end_date]
    );

    res.json(result.rows);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.retrievePaymentAndVAPeriod = async (req, res) => {
  const { start_date, end_date } = req.body;

  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ message: "start_date dan end_date wajib diisi" });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        p.*,
        va.*
      FROM "Payment" p
      LEFT JOIN "VirtualAccount" va
        ON p.va_id = va.va_id
      WHERE p.payment_date BETWEEN
            $1::date
            AND ($2::date + INTERVAL '1 day' - INTERVAL '1 second')
      ORDER BY p.payment_id DESC
      `,
      [start_date, end_date]
    );

    res.json(result.rows);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Payment not found" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Payment not found" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Payment" WHERE payment_id = $1', [id]);
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
