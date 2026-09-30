const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

// ============ SUBSCRIBE NEWSLETTER ============
exports.subscribe = [
  body('email').isEmail().normalizeEmail().withMessage('Email tidak valid'),
  validate,

  async (req, res, next) => {
    try {
      const { email } = req.body;

      const [existing] = await db.query(
        'SELECT id FROM bekal_db_newsletter_subscriptions WHERE email = ? AND is_active = 1',
        [email]
      );

      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email sudah terdaftar newsletter' });
      }

      const user_id = req.user ? req.user.id : null;

      const [result] = await db.query(
        `INSERT INTO bekal_db_newsletter_subscriptions 
         (email, user_id, is_active, subscribed_at) 
         VALUES (?, ?, 1, NOW())`,
        [email, user_id]
      );

      res.status(201).json({
        success: true,
        message: 'Berhasil berlangganan newsletter'
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ UNSUBSCRIBE NEWSLETTER ============
exports.unsubscribe = [
  body('email').isEmail().normalizeEmail().withMessage('Email tidak valid'),
  validate,

  async (req, res, next) => {
    try {
      const { email } = req.body;

      const [result] = await db.query(
        `UPDATE bekal_db_newsletter_subscriptions 
         SET is_active = 0, unsubscribed_at = NOW() 
         WHERE email = ? AND is_active = 1`,
        [email]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Email tidak ditemukan di newsletter' });
      }

      res.json({ success: true, message: 'Berhasil berhenti berlangganan newsletter' });
    } catch (error) {
      next(error);
    }
  }
];

// ============ GET ALL SUBSCRIBERS (admin only) ============
exports.getSubscribers = async (req, res, next) => {
  try {
    const [subscribers] = await db.query(
      `SELECT ns.*, u.full_name, u.email as user_email
       FROM bekal_db_newsletter_subscriptions ns
       LEFT JOIN bekal_db_users u ON ns.user_id = u.id
       WHERE ns.is_active = 1
       ORDER BY ns.subscribed_at DESC`
    );

    res.json({ success: true, count: subscribers.length, data: subscribers });
  } catch (error) {
    next(error);
  }
};