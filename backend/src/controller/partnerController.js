const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

const partnerFields = [
  body('organization_name').trim().notEmpty().withMessage('Nama organisasi wajib diisi')
    .isLength({ max: 150 }).withMessage('Nama organisasi maksimal 150 karakter'),
  body('partner_type')
    .isIn(['EO', 'Perusahaan', 'Lembaga Donor', 'Institusi Pendidikan', 'Lainnya'])
    .withMessage('Jenis partner tidak valid'),
  body('contact_email').isEmail().withMessage('Email kontak tidak valid')
    .isLength({ max: 150 }).withMessage('Email kontak maksimal 150 karakter'),
  body('contact_phone').optional({ values: 'null' }).trim()
    .isLength({ max: 20 }).withMessage('Nomor telepon maksimal 20 karakter')
];

exports.getAll = async (req, res, next) => {
  try {
    const [partners] = await db.query(
      `SELECT id, organization_name, partner_type, contact_email, contact_phone,
              is_verified_partner, created_at
       FROM bekal_db_partners
       WHERE is_verified_partner = 1
       ORDER BY created_at DESC`
    );
    res.json({ success: true, count: partners.length, data: partners });
  } catch (error) {
    next(error);
  }
};

exports.getAllForAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    let whereClause = 'WHERE 1=1';

    if (status === 'pending') whereClause += ' AND p.is_verified_partner = 0';
    if (status === 'verified') whereClause += ' AND p.is_verified_partner = 1';

    const [partners] = await db.query(
      `SELECT p.id, p.user_id, p.organization_name, p.partner_type, p.contact_email,
              p.contact_phone, p.is_verified_partner, p.created_at,
              u.full_name AS user_name, u.email AS user_email, u.role AS user_role
       FROM bekal_db_partners p
       LEFT JOIN bekal_db_users u ON p.user_id = u.id
       ${whereClause}
       ORDER BY p.is_verified_partner ASC, p.created_at DESC`
    );
    res.json({ success: true, count: partners.length, data: partners });
  } catch (error) {
    next(error);
  }
};

exports.getById = [
  param('id').isInt({ min: 1 }).withMessage('ID partner tidak valid'),
  validate,
  async (req, res, next) => {
    try {
      const [partners] = await db.query(
        `SELECT id, organization_name, partner_type, contact_email, contact_phone,
                is_verified_partner, created_at
         FROM bekal_db_partners
         WHERE id = ? AND is_verified_partner = 1`,
        [req.params.id]
      );
      if (!partners.length) {
        return res.status(404).json({ success: false, message: 'Partner tidak ditemukan' });
      }
      res.json({ success: true, data: partners[0] });
    } catch (error) {
      next(error);
    }
  }
];

exports.submitForm = [
  ...partnerFields,
  validate,
  async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Silakan login untuk mengajukan pendaftaran partner'
        });
      }

      const { organization_name, partner_type, contact_email, contact_phone } = req.body;
      const [existing] = await db.query(
        'SELECT id FROM bekal_db_partners WHERE user_id = ? LIMIT 1',
        [req.user.id]
      );
      if (existing.length) {
        return res.status(409).json({
          success: false,
          message: 'Akun ini sudah memiliki pengajuan partner'
        });
      }

      const [result] = await db.query(
        `INSERT INTO bekal_db_partners
          (user_id, organization_name, partner_type, contact_email, contact_phone, is_verified_partner)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [req.user.id, organization_name, partner_type, contact_email, contact_phone || null]
      );
      res.status(201).json({
        success: true,
        message: 'Pengajuan partner berhasil dikirim dan menunggu verifikasi',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }
];

exports.getMyRequests = async (req, res, next) => {
  try {
    const [partners] = await db.query(
      `SELECT id, organization_name, partner_type, contact_email, contact_phone,
              is_verified_partner, created_at
       FROM bekal_db_partners WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, count: partners.length, data: partners });
  } catch (error) {
    next(error);
  }
};

exports.update = [
  param('id').isInt({ min: 1 }).withMessage('ID partner tidak valid'),
  body('organization_name').optional().trim().notEmpty()
    .isLength({ max: 150 }).withMessage('Nama organisasi maksimal 150 karakter'),
  body('partner_type').optional()
    .isIn(['EO', 'Perusahaan', 'Lembaga Donor', 'Institusi Pendidikan', 'Lainnya'])
    .withMessage('Jenis partner tidak valid'),
  body('contact_email').optional().isEmail()
    .isLength({ max: 150 }).withMessage('Email kontak tidak valid'),
  body('contact_phone').optional({ values: 'null' }).trim()
    .isLength({ max: 20 }).withMessage('Nomor telepon maksimal 20 karakter'),
  validate,
  async (req, res, next) => {
    try {
      const allowed = ['organization_name', 'partner_type', 'contact_email', 'contact_phone'];
      const fields = [];
      const values = [];
      for (const key of allowed) {
        if (req.body[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(req.body[key] || null);
        }
      }
      if (!fields.length) {
        return res.status(400).json({ success: false, message: 'Tidak ada data untuk diperbarui' });
      }
      values.push(req.params.id);
      const [result] = await db.query(
        `UPDATE bekal_db_partners SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      if (!result.affectedRows) {
        return res.status(404).json({ success: false, message: 'Partner tidak ditemukan' });
      }
      res.json({ success: true, message: 'Data partner berhasil diperbarui' });
    } catch (error) {
      next(error);
    }
  }
];

exports.verify = [
  param('id').isInt({ min: 1 }).withMessage('ID partner tidak valid'),
  body('is_verified_partner').isBoolean()
    .withMessage('is_verified_partner harus bernilai true atau false'),
  validate,
  async (req, res, next) => {
    const connection = await db.getConnection();
    try {
      const raw = req.body.is_verified_partner;
      const verified = raw === true || raw === 1 || raw === 'true' || raw === '1';

      await connection.beginTransaction();

      const [partners] = await connection.query(
        'SELECT id, user_id FROM bekal_db_partners WHERE id = ? FOR UPDATE',
        [req.params.id]
      );
      if (!partners.length) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'Partner tidak ditemukan' });
      }

      await connection.query(
        'UPDATE bekal_db_partners SET is_verified_partner = ? WHERE id = ?',
        [verified ? 1 : 0, req.params.id]
      );

      if (verified) {
        await connection.query(
          `UPDATE bekal_db_users
           SET role = IF(role IN ('siswa', 'guru_BK'), 'mitra', role),
               is_verified = 1,
               updated_at = NOW()
           WHERE id = ?`,
          [partners[0].user_id]
        );
      } else {
        await connection.query(
          `UPDATE bekal_db_users
           SET is_verified = 0, updated_at = NOW()
           WHERE id = ? AND role = 'mitra'`,
          [partners[0].user_id]
        );
      }

      await connection.commit();
      res.json({ success: true, message: 'Status verifikasi partner berhasil diperbarui' });
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
  param('id').isInt({ min: 1 }).withMessage('ID partner tidak valid'),
  validate,
  async (req, res, next) => {
    try {
      const [result] = await db.query(
        'DELETE FROM bekal_db_partners WHERE id = ?',
        [req.params.id]
      );
      if (!result.affectedRows) {
        return res.status(404).json({ success: false, message: 'Partner tidak ditemukan' });
      }
      res.json({ success: true, message: 'Partner berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }
];