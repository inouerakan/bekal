const pool = require('../config/db');

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
function formatDate(date) {
  if (!date) return 'Segera';
  const d = new Date(date);
  if (isNaN(d)) return 'Segera';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function toCardShape(row) {
  const price = row.cost || 'Gratis';
  return {
    id: row.id,
    category: row.category_name,
    title: row.title,
    organizer: row.organizer_name,
    description: row.description,
    date: formatDate(row.deadline_date || row.deadline),
    price,
    isPaid: String(price).toLowerCase() !== 'gratis',
    status: row.status,
  };
}

// Samain kategori bebas dari form ("Beasiswa Pendidikan", dll) ke 3 kategori utama,
function normalizeCategoryName(rawCategory = '') {
  const value = rawCategory.toLowerCase();
  if (value.includes('lomba')) return 'Lomba';
  if (value.includes('karir') || value.includes('jasa')) return 'Karir & Magang';
  return 'Beasiswa';
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Cari category_id berdasarkan nama, kalau belum ada di tabel kategori -> buat barunya
async function findOrCreateCategoryId(rawCategory) {
  const name = normalizeCategoryName(rawCategory);

  const [rows] = await pool.query(
    'SELECT id FROM bekal_db_categories WHERE name = ? LIMIT 1',
    [name]
  );
  if (rows.length > 0) return rows[0].id;

  const [result] = await pool.query(
    'INSERT INTO bekal_db_categories (name, slug) VALUES (?, ?)',
    [name, slugify(name)]
  );
  return result.insertId;
}

// GET /api/opportunities?category=Lomba&search=coding&page=1&limit=6
async function getOpportunities(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 6, 1);
    const offset = (page - 1) * limit;
    const { category, search } = req.query;

    const where = ["o.status = 'approved'"];
    const params = [];

    if (category && category !== 'Semua') {
      where.push('c.name = ?');
      params.push(category);
    }

    if (search) {
      where.push('(o.title LIKE ? OR o.description LIKE ? OR o.organizer_name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM bekal_db_opportunities o
       JOIN bekal_db_categories c ON c.id = o.category_id
       ${whereClause}`,
      params
    );
    const totalItems = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT o.id, o.title, o.organizer_name, o.description, o.cost, o.deadline_date, o.status,
              c.name AS category_name
       FROM bekal_db_opportunities o
       JOIN bekal_db_categories c ON c.id = o.category_id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: rows.map(toCardShape),
      currentPage: page,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      totalItems,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/opportunities (protected) - sesuai form modal "Ajukan Informasi Baru"
async function createOpportunity(req, res, next) {
  try {
    const { category, title, organizer, description, price, deadline, deadline_date } = req.body;

    if (!title || !organizer || !description) {
      return res.status(400).json({ message: 'title, organizer, dan description wajib diisi' });
    }

    const category_id = await findOrCreateCategoryId(category);

    const rawDeadline = deadline_date || deadline;
    const parsedDeadline = rawDeadline && !Number.isNaN(new Date(rawDeadline).getTime())
      ? new Date(rawDeadline)
      : null;

    const [result] = await pool.query(
      `INSERT INTO bekal_db_opportunities
        (category_id, title, organizer_name, description, cost, deadline_date, status, submitted_by, view_count)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, 0)`,
      [category_id, title, organizer, description, price || 'Gratis', parsedDeadline, req.user.id]
    );

    res.status(201).json({
      message: 'Berhasil diajukan, menunggu verifikasi admin sebelum tampil di katalog',
      id: result.insertId,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOpportunities, createOpportunity };
