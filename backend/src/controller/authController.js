const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const transporter = require('../config/nodemailer');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

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
      
      const [existing] = await db.query(
        'SELECT id FROM bekal_db_users WHERE email = ?',
        [email]
      );
      
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

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
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
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
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }
];

exports.forgotPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Email tidak valid'),
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const [users] = await db.query(
        'SELECT id, full_name FROM bekal_db_users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'Email tidak ditemukan' });
      }

      const user = users[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await db.query(
        'UPDATE bekal_db_users SET reset_token = ?, reset_expires = ? WHERE id = ?',
        [hash, expiresAt, user.id]
      );

      const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      const mailOptions = {
        from: `"Bekal Opat" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Password Bekal Opat',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Halo ${user.full_name},</h2>
            <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
            <p>Silakan klik tombol di bawah ini untuk melanjutkan:</p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#3b82f6;color:white;text-decoration:none;border-radius:6px;margin-top:10px;">Reset Password</a>
            <p style="margin-top:20px;font-size:12px;color:#666;">Jika Anda tidak meminta reset password, abaikan email ini. Link akan kedaluwarsa dalam 10 menit.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: 'Instruksi reset password telah dikirim ke email Anda.'
      });
    } catch (error) {
      next(error);
    }
  }
];

exports.resetPassword = [
  body('token').trim().notEmpty().withMessage('Token tidak valid'),
  body('email').isEmail().normalizeEmail().withMessage('Email tidak valid'),
  body('new_password')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
    .matches(/[0-9]/).withMessage('Password harus mengandung angka'),
  validate,
  async (req, res, next) => {
    try {
      const { token, email, new_password } = req.body;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const [users] = await db.query(
        'SELECT id, reset_expires FROM bekal_db_users WHERE email = ? AND reset_token = ?',
        [email, hashedToken]
      );

      if (users.length === 0) {
        return res.status(400).json({ success: false, message: 'Token tidak valid atau sudah digunakan.' });
      }

      const user = users[0];
      
      if (new Date(user.reset_expires) < new Date()) {
        return res.status(400).json({ success: false, message: 'Token sudah kedaluwarsa. Silakan minta link baru.' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(new_password, salt);

      await db.query(
        'UPDATE bekal_db_users SET password_hash = ?, reset_token = NULL, reset_expires = NULL, updated_at = NOW() WHERE id = ?',
        [password_hash, user.id]
      );

      res.json({
        success: true,
        message: 'Password berhasil diubah. Silakan login dengan password baru.'
      });
    } catch (error) {
      next(error);
    }
  }
];

exports.changePassword = [
  body('old_password').notEmpty().withMessage('Password lama wajib diisi'),
  body('new_password')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
    .matches(/[0-9]/).withMessage('Password harus mengandung angka'),
  validate,
  async (req, res, next) => {
    try {
      const { old_password, new_password } = req.body;
      
      const [users] = await db.query(
        'SELECT password_hash FROM bekal_db_users WHERE id = ?',
        [req.user.id]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      const isMatch = await bcrypt.compare(old_password, users[0].password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Password lama salah' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(new_password, salt);
      
      await db.query(
        'UPDATE bekal_db_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [password_hash, req.user.id]
      );
      
      res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
      next(error);
    }
  }
];