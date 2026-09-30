# Bekal Opat

Platform agregator informasi peluang (beasiswa, lomba, magang) terverifikasi khusus untuk pelajar di Indonesia. Dibangun dengan MERN-like stack (React + Node/Express + MySQL).

## Fitur Utama

- **Katalog Peluang**: Pencarian & filter berdasarkan kategori, jenjang pendidikan, lokasi, dan deadline.
- **Sistem Verifikasi Multi-Level**: 
  - Siswa/Guru BK/Mitra dapat mengajukan info peluang baru.
  - Admin wajib memverifikasi sebelum tayang publik (`pending` → `approved`/`rejected`).
- **Forum Komunitas**: Diskusi antar pengguna dengan fitur like, komentar, dan moderasi soft-delete.
- **Bookmark Simpan Peluang**: Tandai peluang favorit tanpa perlu login ulang saat cek kembali.
- **Newsletter Subscription**: Kirim email massal ke subscriber aktif via SMTP.
- **Admin Dashboard**: Manajemen user, verifikasi partner EO/perusahaan, moderasi forum & peluang real-time.
- **Dark/Light Mode**: Toggle tema global tersimpan di localStorage.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Lucide Icons, React Router v7 |
| Backend | Express 5, MySQL2 (pool), JWT Auth, BcryptJS, Nodemailer |
| DevOps | Dotenv, Morgan logging, Helmet security, CORS whitelist |
| Database | MySQL 8+ (schema terpisah per modul: users, opportunities, categories, partners, forum, bookmarks, reports, newsletter, featured) |

## Setup Lokal

### Prasyarat
- Node.js ≥ 20.x
- npm atau pnpm
- MySQL Server 8+ berjalan lokal
- Git

### Langkah Instalasi

```bash
# Clone repo
git clone https://github.com/username/bekal-opat.git
cd bekal-opat

# Install dependencies backend
cd backend
cp .env.example .env   # Edit nilai DB_* dan SMTP_* sesuai lingkungan Anda
npm install

# Jalankan migrasi/schema awal (jika belum ada tabel)
# Catatan: Schema SQL tersedia di docs/schema.sql — import manual via phpMyAdmin/CLI
mysql -u root -p bekal < schema.sql

# Seed admin default (email: admin@bekalopati.com, pass: admin123)
node src/seeder/admin.js

# Start dev server backend
npm run dev            # http://localhost:5000

# Di terminal lain, install frontend
cd ../frontend
cp .env.example .env   # Pastikan VITE_API_URL=http://localhost:5000
npm install
npm run dev            # http://localhost:5173