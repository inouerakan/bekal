const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const db = require('../config/db');
const { generateToken } = require('../utils/token');
const validate = require('../middleware/validate');

// ============ REGISTER ============
exports.register = [
  body('full_name').trim().notEmpty().withMessage('Nama lengkap wajib diisi'),
  body('email').isEmail().normalizeEmail().withMessage('Email tidak valid'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
    .matches(/[0-9]/).withMessage('Password harus mengandung angka'),
  body('role').optional().isIn(['siswa', 'guru_BK', 'admin', 'mitra']).withMessage('Role tidak valid'),
  validate,

  async (req, res, next) => {
    try {
      const { full_name, email, password, role, school_name, phone } = req.body;

      // Cek email sudah ada
      const [existing] = await db.query(
        'SELECT id FROM bekal_db_users WHERE email = ?',
        [email]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Insert user
      const [result] = await db.query(
        `INSERT INTO bekal_db_users 
         (full_name, email, password_hash, role, school_name, phone, is_verified, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
        [full_name, email, password_hash, role || 'siswa', school_name || null, phone || null]
      );

      const token = generateToken({
        id: result.insertId,
        email,
        role: role || 'siswa'
      });

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          id: result.insertId,
          full_name,
          email,
          role: role || 'siswa',
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ LOGIN ============
exports.login = [
  body('email').isEmail().normalizeEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
  validate,

  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const [users] = await db.query(
        'SELECT * FROM bekal_db_users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      const user = users[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ GET ME ============
exports.getMe = async (req, res, next) => {
  try {
    const [users] = await db.query(
      `SELECT id, full_name, email, role, school_name, phone, is_verified, created_at, updated_at 
       FROM bekal_db_users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
};

// ============ UPDATE PROFILE ============
exports.updateProfile = [
  body('full_name').optional().trim().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('school_name').optional().trim(),
  body('phone').optional().trim(),
  validate,

  async (req, res, next) => {
    try {
      const { full_name, school_name, phone } = req.body;

      const fields = [];
      const values = [];

      if (full_name !== undefined) { fields.push('full_name = ?'); values.push(full_name); }
      if (school_name !== undefined) { fields.push('school_name = ?'); values.push(school_name); }
      if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }

      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada data yang diupdate'
        });
      }

      fields.push('updated_at = NOW()');
      values.push(req.user.id);

      await db.query(
        `UPDATE bekal_db_users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      res.json({
        success: true,
        message: 'Profile berhasil diupdate'
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ CHANGE PASSWORD ============
exports.changePassword = [
  body('old_password').notEmpty().withMessage('Password lama wajib diisi'),
  body('new_password')
    .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
    .matches(/[0-9]/).withMessage('Password harus mengandung angka'),
  validate,

  async (req, res, next) => {
    try {
      const { old_password, new_password } = req.body;

      const [users] = await db.query(
        'SELECT password_hash FROM bekal_db_users WHERE id = ?',
        [req.user.id]
      );

      const isMatch = await bcrypt.compare(old_password, users[0].password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Password lama salah'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(new_password, salt);

      await db.query(
        'UPDATE bekal_db_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [password_hash, req.user.id]
      );

      res.json({
        success: true,
        message: 'Password berhasil diubah'
      });
    } catch (error) {
      next(error);
    }
  }
];