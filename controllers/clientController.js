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
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_name, email, backend_service } = req.body;
    const result = await pool.query(
      `UPDATE "Client"
       SET client_name=$1, email=$2, backend_service=$3
       WHERE client_id=$4 RETURNING *`,
      [client_name, email, backend_service, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Client not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Client" WHERE client_id = $1', [
      id,
    ]);
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
