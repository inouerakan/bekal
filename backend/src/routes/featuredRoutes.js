const express = require('express');
const router = express.Router();
const featuredController = require('../controller/featuredController');
const { authenticate, authorize } = require('../middleware/auth');

// Route Public: Hanya menampilkan yang sudah PAID dan aktif
router.get('/', featuredController.getAll);

// Group Routes Admin/Mitra: Semua membutuhkan autentikasi
// Kita gunakan array [authenticate, authorize(...)] sebagai middleware chain
const adminOnly = [authenticate, authorize('admin')];
const mitraOrAdmin = [authenticate, authorize('admin', 'mitra')];

// Endpoint khusus Admin untuk melihat SEMUA status (termasuk pending/expired)
router.get('/admin/all', ...adminOnly, featuredController.getAllForAdmin);

// Endpoint khusus Admin untuk mengambil list peluang approved guna dropdown modal
router.get('/admin/approved-opportunities', ...adminOnly, featuredController.getApprovedOpportunities);

// Buat Featured Listing baru (Bisa oleh Admin atau Mitra terverifikasi)
router.post('/', ...mitraOrAdmin, featuredController.create);

// Update Status Pembayaran (Hanya Admin)
router.patch('/:id/payment-status', ...adminOnly, featuredController.updatePaymentStatus);

// Hapus Featured Listing (Hanya Admin)
router.delete('/:id', ...adminOnly, featuredController.delete);

module.exports = router;