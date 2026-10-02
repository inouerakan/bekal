const { body, param } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');

const BAD_WORDS = [
  'anjing', 'babi', 'bangsat', 'kontol', 'memek', 'ngentot', 'tolol',
  'goblok', 'bodoh', 'idiot', 'kampret', 'taik', 'tai', 'jancok',
  'cok', 'asu', 'jembut', 'perek', 'lonte', 'bacot', 'sialan'
];

const containsBadWord = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  return BAD_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
};

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

exports.getAllComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
      "SELECT COUNT(*) as total FROM bekal_db_forum WHERE type = 'comment' AND status = 'active'"
    );

    const [comments] = await db.query(
      `SELECT f.*, u.full_name as user_name, p.title as parent_title
       FROM bekal_db_forum f
       LEFT JOIN bekal_db_users u ON f.user_id = u.id
       LEFT JOIN bekal_db_forum p ON f.parent_id = p.id
       WHERE f.type = 'comment' AND f.status = 'active'
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: comments,
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
      let userHasLiked = false;
      if (req.user) {
        const [likeCheck] = await db.query(
          'SELECT id FROM bekal_db_forum_likes WHERE forum_id = ? AND user_id = ?',
          [req.params.id, req.user.id]
        );
        userHasLiked = likeCheck.length > 0;
      }
      res.json({
        success: true,
        data: { ...posts[0], comments, user_has_liked: userHasLiked }
      });
    } catch (error) {
      next(error);
    }
  }
];

exports.createDiscussion = [
  body('title').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('content').trim().notEmpty().withMessage('Konten wajib diisi'),
  body('image_url').optional().isURL().withMessage('URL gambar tidak valid'),
  validate,
  async (req, res, next) => {
    try {
      const { title, content, image_url } = req.body;
      
      if (containsBadWord(title) || containsBadWord(content)) {
        return res.status(400).json({
          success: false,
          message: 'Konten mengandung kata yang tidak pantas.'
        });
      }

      const [result] = await db.query(
        `INSERT INTO bekal_db_forum 
         (user_id, parent_id, type, title, content, image_url, like_count, comment_count, view_count, status, created_at, updated_at) 
         VALUES (?, NULL, 'discussion', ?, ?, ?, 0, 0, 0, 'active', NOW(), NOW())`,
        [req.user.id, title, content, image_url || null]
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
      if (containsBadWord(content)) {
        return res.status(400).json({
          success: false,
          message: 'Komentar mengandung kata yang tidak pantas. Harap gunakan bahasa yang sopan.'
        });
      }
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

exports.toggleLike = [
  param('id').isInt().withMessage('ID harus berupa angka'),
  validate,
  async (req, res, next) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [post] = await connection.query(
        "SELECT id FROM bekal_db_forum WHERE id = ? AND status = 'active' FOR UPDATE",
        [req.params.id]
      );
      if (post.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
      }
      const [existingLike] = await connection.query(
        'SELECT id FROM bekal_db_forum_likes WHERE forum_id = ? AND user_id = ? FOR UPDATE',
        [req.params.id, req.user.id]
      );
      let liked;
      if (existingLike.length > 0) {
        await connection.query(
          'DELETE FROM bekal_db_forum_likes WHERE forum_id = ? AND user_id = ?',
          [req.params.id, req.user.id]
        );
        await connection.query(
          'UPDATE bekal_db_forum SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?',
          [req.params.id]
        );
        liked = false;
      } else {
        await connection.query(
          'INSERT INTO bekal_db_forum_likes (forum_id, user_id, created_at) VALUES (?, ?, NOW())',
          [req.params.id, req.user.id]
        );
        await connection.query(
          'UPDATE bekal_db_forum SET like_count = like_count + 1 WHERE id = ?',
          [req.params.id]
        );
        liked = true;
      }
      const [updated] = await connection.query(
        'SELECT like_count FROM bekal_db_forum WHERE id = ?',
        [req.params.id]
      );
      await connection.commit();
      res.json({
        success: true,
        data: { like_count: updated[0].like_count, liked }
      });
    } catch (error) {
      try { await connection.rollback(); } catch (e) {}
      next(error);
    } finally {
      connection.release();
    }
  }
];

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