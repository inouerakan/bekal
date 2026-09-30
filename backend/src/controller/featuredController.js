const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

// ============ GET ALL FEATURED LISTINGS ============
exports.getAll = async (req, res, next) => {
  try {
    const [featured] = await db.query(
      `SELECT fl.*, o.title as opportunity_title, o.organizer_name, o.deadline,
              p.organization_name as partner_name
       FROM bekal_db_featured_listings fl
       LEFT JOIN bekal_db_opportunities o ON fl.opportunity_id = o.id
       LEFT JOIN bekal_db_partners p ON fl.partner_id = p.id
       WHERE fl.end_date >= CURDATE() AND fl.payment_status = 'paid'
       ORDER BY fl.start_date DESC`
    );

    res.json({ success: true, count: featured.length, data: featured });
  } catch (error) {
    next(error);
  }
};

// ============ CREATE FEATURED LISTING ============
exports.create = [
  body('opportunity_id').isInt().withMessage('Opportunity ID harus berupa angka'),
  body('partner_id').isInt().withMessage('Partner ID harus berupa angka'),
  body('start_date').isDate().withMessage('Start date tidak valid'),
  body('end_date').isDate().withMessage('End date tidak valid'),
  body('price').isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  validate,

  async (req, res, next) => {
    try {
      const { opportunity_id, partner_id, start_date, end_date, price } = req.body;

      const [result] = await db.query(
        `INSERT INTO bekal_db_featured_listings 
         (opportunity_id, partner_id, start_date, end_date, price, payment_status, created_at) 
         VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
        [opportunity_id, partner_id, start_date, end_date, price]
      );

      res.status(201).json({
        success: true,
        message: 'Featured listing berhasil dibuat, menunggu pembayaran',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ UPDATE PAYMENT STATUS (admin only) ============
exports.updatePaymentStatus = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  body('payment_status').isIn(['pending', 'paid', 'expired']).withMessage('Status pembayaran tidak valid'),
  validate,

  async (req, res, next) => {
    try {
      const { payment_status } = req.body;

      const [result] = await db.query(
        'UPDATE bekal_db_featured_listings SET payment_status = ? WHERE id = ?',
        [payment_status, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Featured listing tidak ditemukan' });
      }

      res.json({ success: true, message: 'Status pembayaran berhasil diupdate' });
    } catch (error) {
      next(error);
    }
  }
];

// ============ DELETE FEATURED LISTING ============
exports.delete = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [result] = await db.query(
        'DELETE FROM bekal_db_featured_listings WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Featured listing tidak ditemukan' });
      }

      res.json({ success: true, message: 'Featured listing berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }
];