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
    return BAD_WORDS.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
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

        // Query Total Count
        const countSql = `SELECT COUNT(*) as total FROM bekal_db_forum f ${whereClause}`;
        const [countResult] = await db.execute(countSql, params);

        // Query Data Posts
        // Kita ambil ID user dari token jika ada, agar bisa cek status like
        const userId = req.user ? req.user.id : null;
        
        // Gunakan LEFT JOIN ke tabel likes untuk mendeteksi apakah user ini sudah like post ini
        // Alias l.forum_id IS NOT NULL berarti user sudah like
        const dataSql = `
            SELECT 
                f.*, 
                u.full_name as user_name, 
                u.id as author_id,
                CASE WHEN l.forum_id IS NOT NULL THEN 1 ELSE 0 END as user_has_liked_int
            FROM bekal_db_forum f
            LEFT JOIN bekal_db_users u ON f.user_id = u.id
            LEFT JOIN bekal_db_forum_likes l ON f.id = l.forum_id AND l.user_id = ?
            ${whereClause}
            ORDER BY ${sortField}
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
        
        // Siapkan parameter: pertama userId untuk join condition, sisanya untuk where clause
        const queryParams = [userId, ...params];
        const [posts] = await db.execute(dataSql, queryParams);

        // Transformasi hasil: ubah integer 0/1 menjadi boolean true/false
        const formattedPosts = posts.map(post => ({
            ...post,
            user_has_liked: Boolean(post.user_has_liked_int),
            // Hapus field helper agar response bersih
            user_has_liked_int: undefined 
        }));

        res.json({
            success: true,
            data: formattedPosts,
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

        const [countResult] = await db.execute(
            "SELECT COUNT(*) as total FROM bekal_db_forum WHERE type = 'comment' AND status = 'active'"
        );

        const commentsSql = `
            SELECT 
                c.id, 
                c.content, 
                c.created_at, 
                c.like_count,
                c.user_id as author_id,
                u.full_name as user_name,
                p.id as parent_post_id,
                p.title as parent_title
            FROM bekal_db_forum c
            LEFT JOIN bekal_db_users u ON c.user_id = u.id
            LEFT JOIN bekal_db_forum p ON c.parent_id = p.id
            WHERE c.type = 'comment' AND c.status = 'active'
            ORDER BY c.created_at DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
        const [comments] = await db.execute(commentsSql);

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
            const postId = parseInt(req.params.id);

            const [posts] = await db.execute(
                `SELECT f.*, u.full_name as user_name, u.id as author_id
                 FROM bekal_db_forum f
                 LEFT JOIN bekal_db_users u ON f.user_id = u.id
                 WHERE f.id = ? AND f.status = 'active'`,
                [postId]
            );

            if (posts.length === 0) {
                return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
            }

            await db.execute(
                'UPDATE bekal_db_forum SET view_count = view_count + 1 WHERE id = ?',
                [postId]
            );

            const [comments] = await db.execute(
                `SELECT f.*, u.full_name as user_name, u.id as author_id
                 FROM bekal_db_forum f
                 LEFT JOIN bekal_db_users u ON f.user_id = u.id
                 WHERE f.parent_id = ? AND f.type = 'comment' AND f.status = 'active'
                 ORDER BY f.created_at ASC`,
                [postId]
            );

            let userHasLiked = false;
            let userLikedCommentIds = [];

            if (req.user && req.user.id) {
                const userId = req.user.id;
                const allTargetIds = [postId, ...comments.map(c => c.id)];

                const placeholders = allTargetIds.map(() => '?').join(', ');
                const likeSql = `SELECT forum_id FROM bekal_db_forum_likes WHERE user_id = ? AND forum_id IN (${placeholders})`;
                const [likeCheck] = await db.execute(likeSql, [userId, ...allTargetIds]);

                userHasLiked = likeCheck.some(row => Number(row.forum_id) === postId);
                userLikedCommentIds = likeCheck
                    .filter(row => Number(row.forum_id) !== postId)
                    .map(row => Number(row.forum_id));
            }

            res.json({
                success: true,
                data: {
                    ...posts[0],
                    comments: comments.map(c => ({
                        ...c,
                        user_has_liked: userLikedCommentIds.includes(Number(c.id))
                    })),
                    user_has_liked: userHasLiked
                }
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

            const [result] = await db.execute(
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
            const parentId = parseInt(req.params.id);
            const { content } = req.body;

            const [parent] = await db.execute(
                "SELECT id FROM bekal_db_forum WHERE id = ? AND type = 'discussion' AND status = 'active'",
                [parentId]
            );

            if (parent.length === 0) {
                return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
            }

            if (containsBadWord(content)) {
                return res.status(400).json({
                    success: false,
                    message: 'Komentar mengandung kata yang tidak pantas. Harap gunakan bahasa yang sopan.'
                });
            }

            const [result] = await db.execute(
                `INSERT INTO bekal_db_forum 
                (user_id, parent_id, type, title, content, like_count, comment_count, view_count, status, created_at, updated_at)
                VALUES (?, ?, 'comment', NULL, ?, 0, 0, 0, 'active', NOW(), NOW())`,
                [req.user.id, parentId, content]
            );

            await db.execute(
                'UPDATE bekal_db_forum SET comment_count = comment_count + 1, updated_at = NOW() WHERE id = ?',
                [parentId]
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
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Harap login untuk menyukai post/komentar' });
        }

        const targetId = parseInt(req.params.id);
        const userId = req.user.id;

        try {
            const [target] = await db.execute(
                "SELECT id, type FROM bekal_db_forum WHERE id = ? AND status = 'active'",
                [targetId]
            );

            if (target.length === 0) {
                return res.status(404).json({ success: false, message: 'Target tidak ditemukan' });
            }

            const [existingLike] = await db.execute(
                'SELECT id FROM bekal_db_forum_likes WHERE forum_id = ? AND user_id = ?',
                [targetId, userId]
            );

            let liked;
            if (existingLike.length > 0) {
                await db.execute(
                    'DELETE FROM bekal_db_forum_likes WHERE forum_id = ? AND user_id = ?',
                    [targetId, userId]
                );
                await db.execute(
                    'UPDATE bekal_db_forum SET like_count = GREATEST(CAST(like_count AS SIGNED) - 1, 0) WHERE id = ?',
                    [targetId]
                );
                liked = false;
            } else {
                await db.execute(
                    'INSERT INTO bekal_db_forum_likes (forum_id, user_id, created_at) VALUES (?, ?, NOW())',
                    [targetId, userId]
                );
                await db.execute(
                    'UPDATE bekal_db_forum SET like_count = CAST(like_count AS SIGNED) + 1 WHERE id = ?',
                    [targetId]
                );
                liked = true;
            }

            const [updated] = await db.execute(
                'SELECT like_count FROM bekal_db_forum WHERE id = ?',
                [targetId]
            );

            res.json({
                success: true,
                data: { like_count: updated[0].like_count, liked }
            });
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
            const postId = parseInt(req.params.id);

            const [post] = await db.execute(
                'SELECT id, user_id, type FROM bekal_db_forum WHERE id = ?',
                [postId]
            );

            if (post.length === 0) {
                return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });
            }

            const isOwner = Number(post[0].user_id) === Number(req.user.id);
            const isAdmin = req.user.role === 'admin';

            if (!isAdmin && !isOwner) {
                return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya pemilik atau admin yang dapat menghapus.' });
            }

            if (post[0].type === 'discussion') {
                await db.execute(
                    "UPDATE bekal_db_forum SET status = 'deleted', updated_at = NOW() WHERE parent_id = ?",
                    [postId]
                );
            }

            await db.execute(
                "UPDATE bekal_db_forum SET status = 'deleted', updated_at = NOW() WHERE id = ?",
                [postId]
            );

            res.json({ success: true, message: 'Post berhasil dihapus' });
        } catch (error) {
            next(error);
        }
    }
];