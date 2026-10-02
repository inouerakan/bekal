const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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

exports.create = [
  body('name').trim().notEmpty().withMessage('Nama kategori wajib diisi')
    .isLength({ max: 50 }).withMessage('Nama kategori maksimal 50 karakter'),
  body('slug').optional().trim().isLength({ max: 50 }).withMessage('Slug maksimal 50 karakter'),
  body('description').optional().trim().isLength({ max: 255 }).withMessage('Deskripsi maksimal 255 karakter'),
  validate,

  async (req, res, next) => {
    try {
      const { name, slug, description } = req.body;
      const finalSlug = slugify(slug || name);

      if (!finalSlug) {
        return res.status(400).json({ success: false, message: 'Slug tidak valid' });
      }

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
        data: { id: result.insertId, name, slug: finalSlug, description: description || null }
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Slug sudah digunakan' });
      }
      next(error);
    }
  }
];

exports.update = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  body('name').optional().trim().notEmpty().withMessage('Nama kategori wajib diisi')
    .isLength({ max: 50 }).withMessage('Nama kategori maksimal 50 karakter'),
  body('slug').optional().trim().isLength({ max: 50 }).withMessage('Slug maksimal 50 karakter'),
  body('description').optional().trim().isLength({ max: 255 }).withMessage('Deskripsi maksimal 255 karakter'),
  validate,

  async (req, res, next) => {
    try {
      const { name, slug, description } = req.body;
      const fields = [];
      const values = [];

      if (name !== undefined) {
        fields.push('name = ?');
        values.push(name);
      }

      if (slug !== undefined) {
        const finalSlug = slugify(slug);
        if (!finalSlug) {
          return res.status(400).json({ success: false, message: 'Slug tidak valid' });
        }

        const [existing] = await db.query(
          'SELECT id FROM bekal_db_categories WHERE slug = ? AND id <> ?',
          [finalSlug, req.params.id]
        );
        if (existing.length > 0) {
          return res.status(409).json({ success: false, message: 'Slug sudah digunakan' });
        }

        fields.push('slug = ?');
        values.push(finalSlug);
      }

      if (description !== undefined) {
        fields.push('description = ?');
        values.push(description || null);
      }

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
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Slug sudah digunakan' });
      }
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
        'DELETE FROM bekal_db_categories WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      }

      res.json({ success: true, message: 'Kategori berhasil dihapus' });
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
        return res.status(409).json({
          success: false,
          message: 'Kategori masih dipakai oleh opportunity dan tidak bisa dihapus'
        });
      }
      next(error);
    }
  }
];