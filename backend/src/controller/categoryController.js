const pool = require('../config/db');

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, description FROM bekal_db_categories ORDER BY name ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories };
