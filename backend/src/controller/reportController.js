const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

// ============ GET ALL REPORTS (admin only) ============
exports.getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) { whereClause += ' AND r.status = ?'; params.push(status); }

    const [reports] = await db.query(
      `SELECT r.*, o.title as opportunity_title, u.full_name as reported_by_name
       FROM bekal_db_reports r
       LEFT JOIN bekal_db_opportunities o ON r.opportunity_id = o.id
       LEFT JOIN bekal_db_users u ON r.reported_by = u.id
       ${whereClause}
       ORDER BY r.created_at DESC`,
      params
    );

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
};

// ============ CREATE REPORT ============
exports.create = [
  body('opportunity_id').isInt().withMessage('Opportunity ID harus berupa angka'),
  body('reason').isIn(['link_rusak', 'info_palsu', 'deadline_lewat', 'lainnya']).withMessage('Alasan tidak valid'),
  body('description').trim().notEmpty().withMessage('Deskripsi wajib diisi'),
  validate,

  async (req, res, next) => {
    try {
      const { opportunity_id, reason, description } = req.body;

      const [opp] = await db.query(
        'SELECT id FROM bekal_db_opportunities WHERE id = ?',
        [opportunity_id]
      );

      if (opp.length === 0) {
        return res.status(404).json({ success: false, message: 'Opportunity tidak ditemukan' });
      }

      const [result] = await db.query(
        `INSERT INTO bekal_db_reports 
         (opportunity_id, reported_by, reason, description, status, created_at) 
         VALUES (?, ?, ?, ?, 'open', NOW())`,
        [opportunity_id, req.user.id, reason, description]
      );

      res.status(201).json({
        success: true,
        message: 'Laporan berhasil dikirim',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ UPDATE REPORT STATUS (admin only) ============
exports.updateStatus = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  body('status').isIn(['open', 'reviewed', 'resolved']).withMessage('Status tidak valid'),
  validate,

  async (req, res, next) => {
    try {
      const { status } = req.body;

      const [result] = await db.query(
        'UPDATE bekal_db_reports SET status = ? WHERE id = ?',
        [status, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
      }

      res.json({ success: true, message: 'Status laporan berhasil diupdate' });
    } catch (error) {
      next(error);
    }
  }
];