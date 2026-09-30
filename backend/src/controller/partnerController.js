const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

// ============ GET ALL OPPORTUNITIES ============
exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { category_id, status, education_level, location, search, sort } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (category_id) { whereClause += ' AND o.category_id = ?'; params.push(category_id); }
    if (status) { whereClause += ' AND o.status = ?'; params.push(status); }
    if (education_level) { whereClause += ' AND o.education_level = ?'; params.push(education_level); }
    if (location) { whereClause += ' AND o.location LIKE ?'; params.push(`%${location}%`); }
    if (search) {
      whereClause += ' AND (o.title LIKE ? OR o.description LIKE ? OR o.organizer_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (!req.user || req.user.role !== 'admin') {
      whereClause += " AND o.status = 'approved' AND o.deadline >= CURDATE()";
    }

    const sortField = sort === 'newest' ? 'o.created_at DESC' :
                      sort === 'deadline' ? 'o.deadline ASC' :
                      'o.created_at DESC';

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM bekal_db_opportunities o ${whereClause}`,
      params
    );

    const [opportunities] = await db.query(
      `SELECT o.*, c.name as category_name, c.slug as category_slug
       FROM bekal_db_opportunities o
       LEFT JOIN bekal_db_categories c ON o.category_id = c.id
       ${whereClause}
       ORDER BY ${sortField}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: opportunities,
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

// ============ GET OPPORTUNITY BY ID ============
exports.getById = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [opportunities] = await db.query(
        `SELECT o.*, c.name as category_name, c.slug as category_slug,
                u.full_name as submitted_by_name
         FROM bekal_db_opportunities o
         LEFT JOIN bekal_db_categories c ON o.category_id = c.id
         LEFT JOIN bekal_db_users u ON o.submitted_by = u.id
         WHERE o.id = ?`,
        [req.params.id]
      );

      if (opportunities.length === 0) {
        return res.status(404).json({ success: false, message: 'Opportunity tidak ditemukan' });
      }

      await db.query(
        'UPDATE bekal_db_opportunities SET view_count = view_count + 1 WHERE id = ?',
        [req.params.id]
      );

      res.json({ success: true, data: opportunities[0] });
    } catch (error) {
      next(error);
    }
  }
];

// ============ CREATE OPPORTUNITY ============
exports.create = [
  body('title').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('category_id').isInt().withMessage('Category ID harus berupa angka'),
  body('organizer_name').trim().notEmpty().withMessage('Nama penyelenggara wajib diisi'),
  body('description').trim().notEmpty().withMessage('Deskripsi wajib diisi'),
  body('requirements').optional().trim(),
  body('education_level').isIn(['SMA/SMK', 'D3', 'S1', 'S2', 'Umum']).withMessage('Education level tidak valid'),
  body('location').trim().notEmpty().withMessage('Lokasi wajib diisi'),
  body('cost').optional().trim(),
  body('registration_link').optional().isURL().withMessage('Link registrasi tidak valid'),
  body('deadline').isDate().withMessage('Deadline tidak valid'),
  validate,

  async (req, res, next) => {
    try {
      const {
        title, category_id, organizer_name, description, requirements,
        education_level, location, cost, registration_link, deadline
      } = req.body;

      const [result] = await db.query(
        `INSERT INTO bekal_db_opportunities 
         (category_id, title, organizer_name, description, requirements, education_level, 
          location, cost, registration_link, deadline, status, submitted_by, view_count, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 0, NOW(), NOW())`,
        [category_id, title, organizer_name, description, requirements || null,
         education_level, location, cost || null, registration_link || null, deadline, req.user.id]
      );

      res.status(201).json({
        success: true,
        message: 'Opportunity berhasil dibuat, menunggu verifikasi',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ UPDATE OPPORTUNITY ============
exports.update = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  body('title').optional().trim().notEmpty(),
  body('category_id').optional().isInt(),
  body('organizer_name').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('requirements').optional().trim(),
  body('education_level').optional().isIn(['SMA/SMK', 'D3', 'S1', 'S2', 'Umum']),
  body('location').optional().trim().notEmpty(),
  body('cost').optional().trim(),
  body('registration_link').optional(),
  body('deadline').optional().isDate(),
  validate,

  async (req, res, next) => {
    try {
      const [opp] = await db.query(
        'SELECT id, submitted_by FROM bekal_db_opportunities WHERE id = ?',
        [req.params.id]
      );

      if (opp.length === 0) {
        return res.status(404).json({ success: false, message: 'Opportunity tidak ditemukan' });
      }

      if (req.user.role !== 'admin' && opp[0].submitted_by !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak bisa mengedit opportunity ini' });
      }

      const {
        title, category_id, organizer_name, description, requirements,
        education_level, location, cost, registration_link, deadline
      } = req.body;

      const fields = [];
      const values = [];

      if (title !== undefined) { fields.push('title = ?'); values.push(title); }
      if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
      if (organizer_name !== undefined) { fields.push('organizer_name = ?'); values.push(organizer_name); }
      if (description !== undefined) { fields.push('description = ?'); values.push(description); }
      if (requirements !== undefined) { fields.push('requirements = ?'); values.push(requirements); }
      if (education_level !== undefined) { fields.push('education_level = ?'); values.push(education_level); }
      if (location !== undefined) { fields.push('location = ?'); values.push(location); }
      if (cost !== undefined) { fields.push('cost = ?'); values.push(cost); }
      if (registration_link !== undefined) { fields.push('registration_link = ?'); values.push(registration_link); }
      if (deadline !== undefined) { fields.push('deadline = ?'); values.push(deadline); }

      fields.push('updated_at = NOW()');
      values.push(req.params.id);

      await db.query(
        `UPDATE bekal_db_opportunities SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      res.json({ success: true, message: 'Opportunity berhasil diupdate' });
    } catch (error) {
      next(error);
    }
  }
];

// ============ DELETE OPPORTUNITY ============
exports.delete = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [opp] = await db.query(
        'SELECT id, submitted_by FROM bekal_db_opportunities WHERE id = ?',
        [req.params.id]
      );

      if (opp.length === 0) {
        return res.status(404).json({ success: false, message: 'Opportunity tidak ditemukan' });
      }

      if (req.user.role !== 'admin' && opp[0].submitted_by !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak bisa menghapus opportunity ini' });
      }

      await db.query('DELETE FROM bekal_db_opportunities WHERE id = ?', [req.params.id]);

      res.json({ success: true, message: 'Opportunity berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }
];

// ============ VERIFY OPPORTUNITY (admin only) ============
exports.verify = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  body('status').isIn(['approved', 'rejected']).withMessage('Status harus approved atau rejected'),
  body('rejection_reason').optional().trim(),
  validate,

  async (req, res, next) => {
    try {
      const { status, rejection_reason } = req.body;

      const [result] = await db.query(
        `UPDATE bekal_db_opportunities 
         SET status = ?, rejection_reason = ?, verified_by = ?, updated_at = NOW() 
         WHERE id = ?`,
        [status, rejection_reason || null, req.user.id, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Opportunity tidak ditemukan' });
      }

      res.json({ success: true, message: `Opportunity berhasil di-${status}` });
    } catch (error) {
      next(error);
    }
  }
];

// ============ GET MY OPPORTUNITIES ============
exports.getMyOpportunities = async (req, res, next) => {
  try {
    const [opportunities] = await db.query(
      `SELECT o.*, c.name as category_name 
       FROM bekal_db_opportunities o
       LEFT JOIN bekal_db_categories c ON o.category_id = c.id
       WHERE o.submitted_by = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, count: opportunities.length, data: opportunities });
  } catch (error) {
    next(error);
  }
};