const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

// ============ GET ALL USERS (admin only) ============
exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { role, search } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (role) { whereClause += ' AND role = ?'; params.push(role); }
    if (search) {
      whereClause += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM bekal_db_users ${whereClause}`,
      params
    );

    const [users] = await db.query(
      `SELECT id, full_name, email, role, school_name, phone, is_verified, created_at, updated_at
       FROM bekal_db_users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============ GET USER BY ID ============
exports.getById = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [users] = await db.query(
        `SELECT id, full_name, email, role, school_name, phone, is_verified, created_at, updated_at
         FROM bekal_db_users WHERE id = ?`,
        [req.params.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      res.json({ success: true, data: users[0] });
    } catch (error) {
      next(error);
    }
  }
];

// ============ UPDATE USER (admin only) ============
exports.update = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  body('role').optional().isIn(['siswa', 'guru_BK', 'admin', 'mitra']),
  body('is_verified').optional().isBoolean(),
  validate,

  async (req, res, next) => {
    try {
      const { role, is_verified } = req.body;
      const fields = [];
      const values = [];

      if (role !== undefined) { fields.push('role = ?'); values.push(role); }
      if (is_verified !== undefined) { fields.push('is_verified = ?'); values.push(is_verified ? 1 : 0); }

      if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'Tidak ada data yang diupdate' });
      }

      fields.push('updated_at = NOW()');
      values.push(req.params.id);

      const [result] = await db.query(
        `UPDATE bekal_db_users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      res.json({ success: true, message: 'User berhasil diupdate' });
    } catch (error) {
      next(error);
    }
  }
];

// ============ DELETE USER (admin only) ============
exports.delete = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
      }

      const [result] = await db.query(
        'DELETE FROM bekal_db_users WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      res.json({ success: true, message: 'User berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }
];