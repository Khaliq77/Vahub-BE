const pool = require("../config/db");

// READ ALL
exports.getClients = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "Client" ORDER BY created_at DESC'
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
// exports.updateClient = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { client_name, email, backend_service } = req.body;
//     const result = await pool.query(
//       `UPDATE "Client"
//        SET client_name=$1, email=$2, backend_service=$3
//        WHERE client_id=$4 RETURNING *`,
//       [client_name, email, backend_service, id]
//     );
//     if (result.rows.length === 0)
//       return res.status(404).json({ message: "Client not found" });
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// DELETE
// exports.deleteClient = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query('DELETE FROM "Client" WHERE client_id = $1', [
//       id,
//     ]);
//     res.json({ message: "Client deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.updateClient = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { client_name, email, backend_service, username } = req.body;

    await client.query("BEGIN");

    // 1. Update Client
    const clientResult = await client.query(
      `UPDATE "Client"
       SET client_name = $1,
           email = $2,
           backend_service = $3
       WHERE client_id = $4
       RETURNING *`,
      [client_name, email, backend_service, id]
    );

    if (clientResult.rows.length === 0) {
      throw new Error("Client not found");
    }

    // 2. Update User
    const userResult = await client.query(
      `UPDATE "User"
       SET client_name = $1,
           email = $2
       WHERE username = $3
       RETURNING *`,
      [client_name, email, username]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    await client.query("COMMIT");

    res.json({
      message: "Client & User updated successfully",
      client: clientResult.rows[0],
      user: userResult.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update failed:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

exports.deleteClient = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { username } = req.body;

    await client.query("BEGIN");

    // 1. Delete Client
    await client.query(
      `DELETE FROM "Client" WHERE client_id = $1`,
      [id]
    );

    // 2. Delete User
    await client.query(
      `DELETE FROM "User" WHERE username = $1`,
      [username]
    );

    await client.query("COMMIT");

    res.json({
      message: "Client and User deleted successfully",
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete failed:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

