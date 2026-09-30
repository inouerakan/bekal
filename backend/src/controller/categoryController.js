const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

// ============ GET ALL CATEGORIES ============
exports.getAll = async (req, res, next) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM bekal_db_categories ORDER BY name ASC'
    );

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// ============ GET CATEGORY BY ID ============
exports.getById = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [categories] = await db.query(
        'SELECT * FROM bekal_db_categories WHERE id = ?',
        [req.params.id]
      );

      if (categories.length === 0) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      }

      res.json({ success: true, data: categories[0] });
    } catch (error) {
      next(error);
    }
  }
];

// ============ CREATE CATEGORY (admin only) ============
exports.create = [
  body('name').trim().notEmpty().withMessage('Nama kategori wajib diisi'),
  body('slug').optional().trim(),
  body('description').optional().trim(),
  validate,

  async (req, res, next) => {
    try {
      const { name, slug, description } = req.body;
      const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const [existing] = await db.query(
        'SELECT id FROM bekal_db_categories WHERE slug = ?',
        [finalSlug]
      );

      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Slug sudah digunakan' });
      }

      const [result] = await db.query(
        'INSERT INTO bekal_db_categories (name, slug, description) VALUES (?, ?, ?)',
        [name, finalSlug, description || null]
      );

      res.status(201).json({
        success: true,
        message: 'Kategori berhasil dibuat',
        data: { id: result.insertId, name, slug: finalSlug, description }
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ UPDATE CATEGORY (admin only) ============
exports.update = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  body('name').optional().trim().notEmpty(),
  body('slug').optional().trim(),
  body('description').optional().trim(),
  validate,

  async (req, res, next) => {
    try {
      const { name, slug, description } = req.body;
      const fields = [];
      const values = [];

      if (name !== undefined) { fields.push('name = ?'); values.push(name); }
      if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
      if (description !== undefined) { fields.push('description = ?'); values.push(description); }

      if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'Tidak ada data yang diupdate' });
      }

      values.push(req.params.id);

      const [result] = await db.query(
        `UPDATE bekal_db_categories SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      }

      res.json({ success: true, message: 'Kategori berhasil diupdate' });
    } catch (error) {
      next(error);
    }
  }
];

// ============ DELETE CATEGORY (admin only) ============
exports.delete = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [result] = await db.query(
        'DELETE FROM bekal_db_categories WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      }

      res.json({ success: true, message: 'Kategori berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }
];