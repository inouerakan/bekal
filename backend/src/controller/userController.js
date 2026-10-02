const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');
const { ensurePartnerForUser } = require('../utils/partner');

const USER_COLUMNS = `u.id, u.full_name, u.email, u.role, u.school_name, u.phone, u.is_verified,
  u.created_at, u.updated_at,
  (SELECT MAX(p.is_verified_partner) FROM bekal_db_partners p WHERE p.user_id = u.id) AS partner_verified`;

const toBoolean = (value) => value === true || value === 1 || value === 'true' || value === '1';

exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { role, search } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (role) {
      whereClause += ' AND u.role = ?';
      params.push(role);
    }
    if (search) {
      whereClause += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM bekal_db_users u ${whereClause}`,
      params
    );

    const [users] = await db.query(
      `SELECT ${USER_COLUMNS}
       FROM bekal_db_users u ${whereClause}
       ORDER BY u.created_at DESC
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

exports.getById = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [users] = await db.query(
        `SELECT ${USER_COLUMNS} FROM bekal_db_users u WHERE u.id = ?`,
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

exports.update = [
  param('id').isInt({ min: 1 }).withMessage('ID harus berupa angka'),
  body('role').optional().isIn(['siswa', 'guru_BK', 'admin', 'mitra']).withMessage('Role tidak valid'),
  body('is_verified').optional().isBoolean().withMessage('is_verified harus berupa boolean'),
  validate,

  async (req, res, next) => {
    const connection = await db.getConnection();

    try {
      const userId = parseInt(req.params.id);
      const { role, is_verified } = req.body;

      if (role === undefined && is_verified === undefined) {
        return res.status(400).json({ success: false, message: 'Tidak ada data yang diupdate' });
      }

      await connection.beginTransaction();

      const [rows] = await connection.query(
        'SELECT id, role, is_verified FROM bekal_db_users WHERE id = ? FOR UPDATE',
        [userId]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      const target = rows[0];
      const newRole = role !== undefined ? role : target.role;
      const roleChanged = newRole !== target.role;

      if (roleChanged && userId === req.user.id) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Tidak bisa mengubah role akun sendiri'
        });
      }

      let verified;
      if (is_verified !== undefined) {
        verified = toBoolean(is_verified);
      } else if (newRole === 'mitra' && roleChanged) {
        verified = true;
      }

      const fields = [];
      const values = [];

      if (roleChanged) {
        fields.push('role = ?');
        values.push(newRole);
      }

      if (verified !== undefined) {
        fields.push('is_verified = ?');
        values.push(verified ? 1 : 0);
      }

      if (fields.length > 0) {
        fields.push('updated_at = NOW()');
        values.push(userId);
        await connection.query(
          `UPDATE bekal_db_users SET ${fields.join(', ')} WHERE id = ?`,
          values
        );
      }

      if (newRole === 'mitra' && verified !== undefined) {
        await ensurePartnerForUser(userId, verified, connection);
      }

      if (target.role === 'mitra' && roleChanged) {
        await connection.query(
          'UPDATE bekal_db_partners SET is_verified_partner = 0 WHERE user_id = ?',
          [userId]
        );
      }

      await connection.commit();

      const [updated] = await db.query(
        `SELECT ${USER_COLUMNS} FROM bekal_db_users u WHERE u.id = ?`,
        [userId]
      );

      res.json({
        success: true,
        message: 'User berhasil diupdate',
        data: updated[0]
      });
    } catch (error) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(rollbackError.message);
      }
      next(error);
    } finally {
      connection.release();
    }
  }
];

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

// ============ UPDATE MY PROFILE ============
exports.updateMyProfile = [
  body('full_name').optional().trim().notEmpty().withMessage('Nama tidak boleh kosong')
    .isLength({ max: 150 }).withMessage('Nama maksimal 150 karakter'),
  body('school_name').optional({ values: 'falsy' }).trim()
    .isLength({ max: 150 }).withMessage('Nama sekolah maksimal 150 karakter'),
  body('phone').optional({ values: 'falsy' }).trim()
    .isLength({ max: 20 }).withMessage('Nomor telepon maksimal 20 karakter'),
  validate,
  async (req, res, next) => {
    try {
      const { full_name, school_name, phone } = req.body;
      
      // Cek apakah ada data yang dikirim
      if (full_name === undefined && school_name === undefined && phone === undefined) {
        return res.status(400).json({ success: false, message: 'Tidak ada data yang diubah' });
      }

      const fields = [];
      const values = [];

      if (full_name !== undefined) { fields.push('full_name = ?'); values.push(full_name); }
      if (school_name !== undefined) { fields.push('school_name = ?'); values.push(school_name || null); }
      if (phone !== undefined) { fields.push('phone = ?'); values.push(phone || null); }

      fields.push('updated_at = NOW()');
      values.push(req.user.id);

      await db.query(
        `UPDATE bekal_db_users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      // Ambil data terbaru untuk dikembalikan
      const [updated] = await db.query(
        `SELECT ${USER_COLUMNS} FROM bekal_db_users u WHERE u.id = ?`,
        [req.user.id]
      );

      res.json({
        success: true,
        message: 'Profil berhasil diperbarui',
        data: updated[0]
      });
    } catch (error) {
      next(error);
    }
  }
];