const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateToken } = require('../utils/token');

// Kolom yang aman dikirim ke frontend (tanpa password_hash)
const PUBLIC_USER_FIELDS =
  'id, full_name, email, role, school_name, phone, is_verified, created_at';

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { full_name, email, password, phone, school_name, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'full_name, email, dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const allowedRoles = ['siswa', 'guru_BK', 'mitra'];
    const finalRole = allowedRoles.includes(role) ? role : 'siswa'; // admin tidak boleh dibuat via register

    const [existing] = await pool.query(
      'SELECT id FROM bekal_db_users WHERE email = ? LIMIT 1',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO bekal_db_users (full_name, email, password_hash, role, school_name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, password_hash, finalRole, school_name || null, phone || null]
    );

    const [rows] = await pool.query(
      `SELECT ${PUBLIC_USER_FIELDS} FROM bekal_db_users WHERE id = ?`,
      [result.insertId]
    );

    const user = rows[0];
    const token = generateToken({ id: user.id, role: user.role });

    res.status(201).json({ message: 'Registrasi berhasil', token, user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM bekal_db_users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    delete user.password_hash;
    const token = generateToken({ id: user.id, role: user.role });

    res.json({ message: 'Login berhasil', token, user });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me (protected)
async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_USER_FIELDS} FROM bekal_db_users WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
