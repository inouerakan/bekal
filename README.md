# Bekal Opat - Platform Informasi Peluang Pelajar

Bekal Opat adalah platform web yang menyediakan informasi terverifikasi mengenai beasiswa, lomba, magang, dan peluang karir lainnya untuk pelajar di Indonesia. Proyek ini dibangun menggunakan React (Vite) untuk frontend dan Express.js untuk backend.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router DOM, Lucide React.
- **Backend:** Node.js, Express 5, MySQL2 (MariaDB/MySQL), JWT, Nodemailer, Cloudinary.
- **Database:** MariaDB / MySQL.

## 📋 Prasyarat

Pastikan Anda telah menginstal software berikut di komputer Anda:
1.  **Node.js** (Versi 18 atau lebih baru disarankan).
2.  **Git**.
3.  **Database Server** (MySQL atau MariaDB).
4.  **Cloudinary Account** (Untuk fitur upload gambar - Opsional tapi disarankan).
5.  **Email SMTP** (Gmail App Password atau sejenisnya untuk fitur reset password).

---

## 🚀 Panduan Instalasi & Setup

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lingkungan lokal Anda.

### 1. Clone Repository

Buka terminal/command prompt dan jalankan perintah:

```bash
git clone <url-repository-anda>
cd bekal-opat

### 2. Setup Database

1.  Buka aplikasi database Anda (phpMyAdmin, MySQL Workbench, atau CLI).
2.  Buat database baru bernama `bekal`.
    ```sql
    CREATE DATABASE bekal;
    ```
3.  Import struktur tabel dari file schema yang tersedia:
    -   Cari file `backend/schema.sql`.
    -   Import file tersebut ke dalam database `bekal` yang baru dibuat.

### 3. Setup Backend

Masuk ke direktori backend:

```bash
cd backend
```

#### A. Konfigurasi Environment
Buat file bernama `.env` di dalam folder `backend`, lalu isi dengan konfigurasi berikut (sesuaikan dengan data lokal Anda):

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
APP_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=bekal

# JWT Secret (Buat string acak yang panjang)
JWT_SECRET=rahasia_super_amandanpanjang_12345
JWT_EXPIRES_IN=7d

# Email (SMTP) - Contoh Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email_anda@gmail.com
SMTP_PASS=password_aplikasi_gmail_anda

# Cloudinary (Untuk Upload Gambar)
CLOUDINARY_CLOUD_NAME=nama_cloud_anda
CLOUDINARY_API_KEY=api_key_anda
CLOUDINARY_API_SECRET=api_secret_anda
CLOUDINARY_UPLOAD_PRESET=bekal_upload
```

#### B. Clean Install Dependencies
Untuk memastikan tidak ada konflik dependensi (terutama karena adanya `react` di `package.json` backend yang tidak lazim), lakukan pembersihan total:

1.  Hapus folder `node_modules` dan file `package-lock.json` jika ada:
    ```bash
    rm -rf node_modules package-lock.json
    # Atau di Windows CMD:
    # rmdir /s /q node_modules
    # del package-lock.json
    ```

2.  **(Penting)** Buka file `package.json` di folder backend, dan hapus baris `"react": "^19.3.0"` dari bagian `dependencies` jika ada, karena React tidak seharusnya diinstal di backend.

3.  Install ulang dependencies:
    ```bash
    npm install
    ```

#### C. Jalankan Seeder Admin
Script ini akan membuat akun administrator default di database.
-   **Email:** `admin@bekalopati.com`
-   **Password:** `admin123`

Jalankan perintah:
```bash
node src/seeder/admin.js
```
*Catatan: Script akan otomatis berhenti setelah selesai.*

#### D. Jalankan Server Backend
```bash
npm run dev
```
Server akan berjalan di `http://localhost:5000`.

---

### 4. Setup Frontend

Buka tab terminal baru, masuk ke direktori frontend (dari root proyek):

```bash
cd frontend
```

#### A. Clean Install Dependencies
Lakukan pembersihan untuk memastikan versi package sesuai:

1.  Hapus folder `node_modules` dan lock file:
    ```bash
    rm -rf node_modules package-lock.json
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

#### B. Jalankan Development Server
```bash
npm run dev
```

Aplikasi frontend akan berjalan di `http://localhost:5173`.

---

## 🏃 Menjalankan Proyek

1.  Pastikan **Backend** berjalan di port 5000.
2.  Pastikan **Frontend** berjalan di port 5173.
3.  Buka browser dan akses `http://localhost:5173`.
4.  Login sebagai Admin menggunakan kredensial seeder untuk mengakses dashboard admin di `/admin`.

## 📂 Struktur Folder Utama

```text
bekal-opat/
├── backend/            # Source code API (Express)
│   ├── src/
│   │   ├── config/     # Koneksi DB, Cloudinary, Nodemailer
│   │   ├── controller/ # Logic bisnis API
│   │   ├── routes/     # Definisi endpoint API
│   │   └── seeder/     # Script pengisian data awal (Admin)
│   ├── .env            # File konfigurasi environment (buat manual)
│   ├── schema.sql      # Struktur database
│   └── server.js       # Entry point backend
├── frontend/           # Source code UI (React + Vite)
│   ├── src/
│   │   ├── components/ # Komponen UI reusable
│   │   ├── pages/      # Halaman aplikasi
│   │   └── context/    # Global state (Theme, Auth)
│   └── vite.config.js  # Konfigurasi Vite & Proxy
└── README.md
```

## ⚠️ Troubleshooting

-   **Error ECONNREFUSED saat frontend jalan:** Pastikan backend sudah dinyalakan (`npm run dev` di folder backend).
-   **Error Database Access Denied:** Cek kembali username dan password di file `.env` backend.
-   **Gambar tidak bisa upload:** Pastikan kredensial Cloudinary di `.env` sudah benar dan Upload Preset di dashboard Cloudinary sudah diatur ke mode "Unsigned".

---
Made with ❤️ by Bekal Opat Team.
```
