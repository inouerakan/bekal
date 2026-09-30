const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

// ============ GET MY BOOKMARKS ============
exports.getMyBookmarks = async (req, res, next) => {
  try {
    const [bookmarks] = await db.query(
      `SELECT b.id, b.opportunity_id, b.created_at,
              o.title, o.organizer_name, o.deadline, o.location, o.status,
              c.name as category_name
       FROM bekal_db_bookmarks b
       JOIN bekal_db_opportunities o ON b.opportunity_id = o.id
       LEFT JOIN bekal_db_categories c ON o.category_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, count: bookmarks.length, data: bookmarks });
  } catch (error) {
    next(error);
  }
};

// ============ ADD BOOKMARK ============
exports.add = [
  body('opportunity_id').isInt().withMessage('Opportunity ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const { opportunity_id } = req.body;

      const [opp] = await db.query(
        'SELECT id FROM bekal_db_opportunities WHERE id = ?',
        [opportunity_id]
      );

      if (opp.length === 0) {
        return res.status(404).json({ success: false, message: 'Opportunity tidak ditemukan' });
      }

      const [existing] = await db.query(
        'SELECT id FROM bekal_db_bookmarks WHERE user_id = ? AND opportunity_id = ?',
        [req.user.id, opportunity_id]
      );

      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Opportunity sudah di-bookmark' });
      }

      const [result] = await db.query(
        'INSERT INTO bekal_db_bookmarks (user_id, opportunity_id, created_at) VALUES (?, ?, NOW())',
        [req.user.id, opportunity_id]
      );

      res.status(201).json({
        success: true,
        message: 'Bookmark berhasil ditambahkan',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ REMOVE BOOKMARK ============
exports.remove = [
  param('opportunity_id').isInt().withMessage('Opportunity ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [result] = await db.query(
        'DELETE FROM bekal_db_bookmarks WHERE user_id = ? AND opportunity_id = ?',
        [req.user.id, req.params.opportunity_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Bookmark tidak ditemukan' });
      }

      res.json({ success: true, message: 'Bookmark berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }
];

// ============ CHECK BOOKMARK STATUS ============
exports.checkStatus = [
  param('opportunity_id').isInt().withMessage('Opportunity ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [bookmarks] = await db.query(
        'SELECT id FROM bekal_db_bookmarks WHERE user_id = ? AND opportunity_id = ?',
        [req.user.id, req.params.opportunity_id]
      );

      res.json({
        success: true,
        data: { is_bookmarked: bookmarks.length > 0 }
      });
    } catch (error) {
      next(error);
    }
  }
];