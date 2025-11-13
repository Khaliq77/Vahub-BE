const pool = require('../config/db');

// CREATE
exports.createInstitution = async (req, res) => {
  try {
    const { institution_name, address, email, phone } = req.body;
    const result = await pool.query(
      `INSERT INTO "Institution" (institution_name, address, email, phone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [institution_name, address, email, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create institution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ ALL
exports.getInstitutions = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Institution" ORDER BY institution_id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// READ ONE
exports.getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "Institution" WHERE institution_id = $1', [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Institution not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE
exports.updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { institution_name, address, email, phone } = req.body;
    const result = await pool.query(
      `UPDATE "Institution"
       SET institution_name=$1, address=$2, email=$3, phone=$4
       WHERE institution_id=$5 RETURNING *`,
      [institution_name, address, email, phone, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Institution not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE
exports.deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "Institution" WHERE institution_id = $1', [id]);
    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
