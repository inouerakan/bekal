const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

// ============ GET ALL FORUM POSTS ============
exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { search, sort } = req.query;

    let whereClause = "WHERE f.type = 'discussion' AND f.status = 'active'";
    const params = [];

    if (search) {
      whereClause += ' AND (f.title LIKE ? OR f.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const sortField = sort === 'popular' ? 'f.like_count DESC' :
                      sort === 'most_commented' ? 'f.comment_count DESC' :
                      'f.created_at DESC';

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM bekal_db_forum f ${whereClause}`,
      params
    );

    const [posts] = await db.query(
      `SELECT f.*, u.full_name as user_name
       FROM bekal_db_forum f
       LEFT JOIN bekal_db_users u ON f.user_id = u.id
       ${whereClause}
       ORDER BY ${sortField}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: posts,
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

// ============ GET FORUM POST BY ID ============
exports.getById = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [posts] = await db.query(
        `SELECT f.*, u.full_name as user_name
         FROM bekal_db_forum f
         LEFT JOIN bekal_db_users u ON f.user_id = u.id
         WHERE f.id = ? AND f.status = 'active'`,
        [req.params.id]
      );

      if (posts.length === 0) {
        return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
      }

      await db.query(
        'UPDATE bekal_db_forum SET view_count = view_count + 1 WHERE id = ?',
        [req.params.id]
      );

      const [comments] = await db.query(
        `SELECT f.*, u.full_name as user_name
         FROM bekal_db_forum f
         LEFT JOIN bekal_db_users u ON f.user_id = u.id
         WHERE f.parent_id = ? AND f.type = 'comment' AND f.status = 'active'
         ORDER BY f.created_at ASC`,
        [req.params.id]
      );

      res.json({ success: true, data: { ...posts[0], comments } });
    } catch (error) {
      next(error);
    }
  }
];

// ============ CREATE DISCUSSION POST ============
exports.createDiscussion = [
  body('title').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('content').trim().notEmpty().withMessage('Konten wajib diisi'),
  validate,

  async (req, res, next) => {
    try {
      const { title, content } = req.body;

      const [result] = await db.query(
        `INSERT INTO bekal_db_forum 
         (user_id, parent_id, type, title, content, like_count, comment_count, view_count, status, created_at, updated_at) 
         VALUES (?, NULL, 'discussion', ?, ?, 0, 0, 0, 'active', NOW(), NOW())`,
        [req.user.id, title, content]
      );

      res.status(201).json({
        success: true,
        message: 'Diskusi berhasil dibuat',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ CREATE COMMENT ============
exports.createComment = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  body('content').trim().notEmpty().withMessage('Komentar wajib diisi'),
  validate,

  async (req, res, next) => {
    try {
      const [parent] = await db.query(
        "SELECT id FROM bekal_db_forum WHERE id = ? AND type = 'discussion' AND status = 'active'",
        [req.params.id]
      );

      if (parent.length === 0) {
        return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
      }

      const { content } = req.body;

      const [result] = await db.query(
        `INSERT INTO bekal_db_forum 
         (user_id, parent_id, type, title, content, like_count, comment_count, view_count, status, created_at, updated_at) 
         VALUES (?, ?, 'comment', NULL, ?, 0, 0, 0, 'active', NOW(), NOW())`,
        [req.user.id, req.params.id, content]
      );

      await db.query(
        'UPDATE bekal_db_forum SET comment_count = comment_count + 1, updated_at = NOW() WHERE id = ?',
        [req.params.id]
      );

      res.status(201).json({
        success: true,
        message: 'Komentar berhasil ditambahkan',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }
];

// ============ LIKE POST ============
exports.toggleLike = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [post] = await db.query(
        "SELECT id FROM bekal_db_forum WHERE id = ? AND status = 'active'",
        [req.params.id]
      );

      if (post.length === 0) {
        return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
      }

      await db.query(
        'UPDATE bekal_db_forum SET like_count = like_count + 1 WHERE id = ?',
        [req.params.id]
      );

      const [updated] = await db.query(
        'SELECT like_count FROM bekal_db_forum WHERE id = ?',
        [req.params.id]
      );

      res.json({ success: true, data: { like_count: updated[0].like_count } });
    } catch (error) {
      next(error);
    }
  }
];

// ============ DELETE POST ============
exports.delete = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,

  async (req, res, next) => {
    try {
      const [post] = await db.query(
        'SELECT id, user_id FROM bekal_db_forum WHERE id = ?',
        [req.params.id]
      );

      if (post.length === 0) {
        return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
      }

      if (req.user.role !== 'admin' && post[0].user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
      }

      await db.query(
        "UPDATE bekal_db_forum SET status = 'deleted', updated_at = NOW() WHERE id = ?",
        [req.params.id]
      );

      res.json({ success: true, message: 'Post berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }
];