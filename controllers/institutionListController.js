const pool = require('../config/db');

// READ ALL (formatted)
exports.getInstitutionList = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT institution_code, institution_name 
       FROM "InstitutionList"
       ORDER BY institutionList_id ASC`
    );

    const formatted = result.rows.map(item => ({
      code: item.institution_code,
      name: item.institution_name,
      label: `${item.institution_code} - ${item.institution_name}`
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching institutions:", error);
    res.status(500).json({ message: "Server error" });
  }
};
