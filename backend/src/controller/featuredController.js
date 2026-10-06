const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

exports.getAll = async (req, res, next) => {
  try {
    const [featured] = await db.query(
      `SELECT fl.*, o.title as opportunity_title, o.description as opportunity_description, 
              o.image_url as opportunity_image_url, o.deadline as opportunity_deadline,
              o.location as opportunity_location, c.name as category_name,
              p.organization_name as partner_name
       FROM bekal_db_featured_listings fl
       LEFT JOIN bekal_db_opportunities o ON fl.opportunity_id = o.id
       LEFT JOIN bekal_db_categories c ON o.category_id = c.id
       LEFT JOIN bekal_db_partners p ON fl.partner_id = p.id
       WHERE fl.end_date >= CURDATE() AND fl.payment_status = 'paid'
       ORDER BY fl.start_date DESC`
    );
    res.json({ success: true, count: featured.length, data: featured });
  } catch (error) {
    next(error);
  }
};

exports.getAllForAdmin = async (req, res, next) => {
  try {
    const [featured] = await db.query(
      `SELECT fl.*, o.title as opportunity_title, o.description as opportunity_description, 
              o.image_url as opportunity_image_url, o.deadline as opportunity_deadline,
              o.location as opportunity_location, c.name as category_name,
              p.organization_name as partner_name
       FROM bekal_db_featured_listings fl
       LEFT JOIN bekal_db_opportunities o ON fl.opportunity_id = o.id
       LEFT JOIN bekal_db_categories c ON o.category_id = c.id
       LEFT JOIN bekal_db_partners p ON fl.partner_id = p.id
       ORDER BY fl.created_at DESC`
    );
    res.json({ success: true, count: featured.length, data: featured });
  } catch (error) {
    next(error);
  }
};

exports.getApprovedOpportunities = async (req, res, next) => {
  try {
    const [opportunities] = await db.query(
      `SELECT o.id, o.title, o.status, u.full_name as owner_name, p.organization_name as partner_name
       FROM bekal_db_opportunities o
       LEFT JOIN bekal_db_users u ON o.submitted_by = u.id
       LEFT JOIN bekal_db_partners p ON u.id = p.user_id AND p.is_verified_partner = 1
       WHERE o.status = 'approved'
       ORDER BY o.created_at DESC`
    );
    res.json({ success: true, count: opportunities.length, data: opportunities });
  } catch (error) {
    next(error);
  }
};

exports.create = [
  body('opportunity_id').isInt().withMessage('Opportunity ID harus berupa angka'),
  body('start_date').isISO8601().withMessage('Start date tidak valid'),
  body('end_date').isISO8601().withMessage('End date tidak valid'),
  body('price').isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  validate,
  async (req, res, next) => {
    try {
      const { opportunity_id, start_date, end_date, price } = req.body;

      // 1. Cek apakah opportunity ada dan approved
      const [oppExists] = await db.query(
        'SELECT id, status, submitted_by FROM bekal_db_opportunities WHERE id = ?',
        [opportunity_id]
      );
      
      if (oppExists.length === 0) {
        return res.status(404).json({ success: false, message: 'Opportunity tidak ditemukan' });
      }

      if (oppExists[0].status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Hanya opportunity yang sudah disetujui admin yang bisa dijadikan featured' });
      }

      const ownerId = oppExists[0].submitted_by;

      // 2. Cari ID Partner berdasarkan Owner/User ID
      // Kita ambil partner pertama yang terverifikasi milik user ini
      const [partnerCheck] = await db.query(
        'SELECT id FROM bekal_db_partners WHERE user_id = ? AND is_verified_partner = 1 LIMIT 1',
        [ownerId]
      );

      let finalPartnerId = null;

      if (partnerCheck.length > 0) {
        finalPartnerId = partnerCheck[0].id;
      } else {
        // Jika user belum punya profile partner terverifikasi, kita buat otomatis (opsional, tergantung kebijakan bisnis)
        // Atau tolak permintaan. Untuk demo ini, kita akan menolak jika tidak ada partner valid agar FK aman.
        return res.status(400).json({ 
          success: false, 
          message: 'Pemilik peluang belum memiliki profil Mitra Terverifikasi. Hubungi admin atau lengkapi profil mitra.' 
        });
      }

      // 3. Insert Featured Listing
      const [result] = await db.query(
        `INSERT INTO bekal_db_featured_listings 
         (opportunity_id, partner_id, start_date, end_date, price, payment_status, created_at) 
         VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
        [opportunity_id, finalPartnerId, start_date, end_date, price]
      );

      res.status(201).json({
        success: true,
        message: 'Featured listing berhasil dibuat, menunggu konfirmasi pembayaran',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }
];

exports.updatePaymentStatus = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  body('payment_status').isIn(['pending', 'paid', 'failed']).withMessage('Status pembayaran tidak valid'),
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

      res.json({ success: true, message: `Status pembayaran diperbarui menjadi ${payment_status}` });
    } catch (error) {
      next(error);
    }
  }
];

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