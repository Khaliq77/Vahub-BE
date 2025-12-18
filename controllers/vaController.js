const pool = require("../config/db");

/**
 * =========================
 * HELPER: STATUS REAL
 * =========================
 */
const resolveVAStatus = (va) => {
  if (va.status === "paid") return "paid";
  if (va.status === "cancelled") return "cancelled";

  if (va.expired_at && new Date(va.expired_at) < new Date()) {
    return "expired";
  }

  return va.status; // active
};

/**
 * =========================
 * CREATE VA (BULK)
 * =========================
 */
exports.createVA = async (req, res) => {
  const client_id = req.body.client_id;
  const data = req.body.data; // ARRAY

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: "Data VA kosong" });
  }

  if (!client_id) {
    return res.status(400).json({ message: "Client ID wajib" });
  }

  try {
    // 🔍 Validasi client sekali saja
    const inst = await pool.query(
      'SELECT * FROM "Client" WHERE client_id = $1',
      [client_id]
    );

    if (inst.rows.length === 0) {
      return res.status(400).json({ message: "Client not found" });
    }

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

      // // 🔐 Validasi transfer method
      // const allowedMethods = [
      //   "ATM",
      //   "OTHER_BANK",
      //   "MOBILE",
      //   "BRANCH",
      //   "OTHER_PAYMENT",
      // ];
      // if (transfer_method && !allowedMethods.includes(transfer_method)) {
      //   return res.status(400).json({
      //     message: "Transfer method tidak valid",
      //     transfer_method,
      //   });
      // }

      // 🔁 Cek duplicate VA
      const checkVA = await pool.query(
        `SELECT 1 FROM "VirtualAccount" WHERE va_number = $1`,
        [va_number]
      );

      if (checkVA.rows.length > 0) {
        return res.status(400).json({
          message: "VA Number sudah digunakan",
          va_number,
        });
      }

      // ✅ INSERT VA
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
          payment_status,
          status,
          expired_at,
          created_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,
          'unpaid','active',
          NOW() + INTERVAL '24 HOURS',
          NOW()
        )
        RETURNING *
        `,
        [
          client_id,
          va_number,
          customer_name,
          customer_email || null,
          billing_amount,
          billing_type,
          settlement_account || null,
          description || null,
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

/**
 * =========================
 * READ ALL VA
 * =========================
 */
exports.getVAs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, i.institution_name
       FROM "VirtualAccount" v
       JOIN "Client" i ON v.client_id = i.client_id
       ORDER BY v.va_id ASC`
    );

    const data = result.rows.map((va) => ({
      ...va,
      status: resolveVAStatus(va), // 🔥 STATUS REAL
    }));

    res.json(data);
  } catch (error) {
    console.error("Get VAs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =========================
 * READ VA BY ID
 * =========================
 */
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

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Virtual Account not found" });
    }

    const va = result.rows[0];

    res.json({
      ...va,
      status: resolveVAStatus(va), // 🔥 STATUS REAL
    });
  } catch (error) {
    console.error("Get VA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =========================
 * UPDATE VA
 * =========================
 */
exports.updateVA = async (req, res) => {
  try {
    const { id } = req.params;
    const { va_number, customer_name } = req.body;

    const result = await pool.query(
      `UPDATE "VirtualAccount"
       SET va_number = $1,
           customer_name = $2
       WHERE va_id = $3
       RETURNING *`,
      [va_number, customer_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Virtual Account not found" });
    }

    res.json({
      ...result.rows[0],
      status: resolveVAStatus(result.rows[0]),
    });
  } catch (error) {
    console.error("Update VA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =========================
 * DELETE VA
 * =========================
 */
exports.deleteVA = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM "VirtualAccount" WHERE va_id = $1',
      [id]
    );

    res.json({ message: "Virtual Account deleted successfully" });
  } catch (error) {
    console.error("Delete VA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
