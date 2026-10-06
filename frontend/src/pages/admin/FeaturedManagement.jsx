import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { CheckCircle, XCircle, Loader2, Plus, DollarSign, CalendarDays, AlertTriangle } from 'lucide-react';

export default function FeaturedManagement() {
  const [listings, setListings] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  
  // State form tanpa partner_id karena ditangani backend
  const [newListing, setNewListing] = useState({
    opportunity_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    price: 50000
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [featuredRes, oppsRes] = await Promise.all([
        apiFetch('/api/featured/admin/all'),
        apiFetch('/api/featured/admin/approved-opportunities')
      ]);
      
      setListings(featuredRes.data || []);
      setOpportunities(oppsRes.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (!confirm('Yakin menandai slot ini sebagai LUNAS? Slot akan langsung tampil di Beranda.')) return;
    
    try {
      await apiFetch(`/api/featured/${id}/payment-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'paid' })
      });
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus featured listing ini secara permanen?')) return;
    try {
      await apiFetch(`/api/featured/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Kirim hanya data yang diperlukan. 
      // Backend akan resolve partner_id berdasarkan opportunity owner.
      await apiFetch('/api/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing) 
      });
      
      setShowCreateModal(false);
      setNewListing({
        opportunity_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 50000
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Gagal membuat slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
    };
    return map[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-1 dark:text-white">Kelola Slot Iklan</h1>
          <p className="text-dark-2 dark:text-gray-400 text-sm mt-1">
            Atur monetisasi melalui sponsored listing (Revenue Stream B2B).
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-dark rounded-xl hover:bg-accent transition-all shadow-lg hover:shadow-primary/20 font-semibold text-sm"
        >
          <Plus size={18} /> Tambah Slot Baru
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-light-2/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-dark-2 uppercase font-bold tracking-wider mb-1">Total Slot Aktif</p>
            <p className="text-2xl font-bold text-dark-1">{listings.length}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
            <CalendarDays size={20} />
          </div>
        </div>
        
        <div className="bg-surface p-5 rounded-2xl border border-light-2/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-dark-2 uppercase font-bold tracking-wider mb-1">Menunggu Bayar</p>
            <p className="text-2xl font-bold text-yellow-600">
              {listings.filter(l => l.payment_status === 'pending').length}
            </p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-600">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-light-2/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-dark-2 uppercase font-bold tracking-wider mb-1">Estimasi Pendapatan</p>
            <p className="text-2xl font-bold text-green-600">
              Rp {listings.filter(l => l.payment_status === 'paid').reduce((sum, l) => sum + Number(l.price), 0).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface rounded-2xl border border-light-2/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-light-1/50 text-dark-2 uppercase text-[10px] font-bold tracking-wider border-b border-light-2/50">
              <tr>
                <th className="px-6 py-4">Judul Peluang</th>
                <th className="px-6 py-4">Mitra Pemilik</th>
                <th className="px-6 py-4">Periode Tayang</th>
                <th className="px-6 py-4">Harga Sewa</th>
                <th className="px-6 py-4">Status Pembayaran</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-2/50">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-dark-2/50 space-y-3">
                      <DollarSign size={48} strokeWidth={1} className="opacity-20" />
                      <p className="font-medium">Belum ada slot iklan terdaftar.</p>
                      <p className="text-xs">Klik "Tambah Slot Baru" untuk memulai monetisasi.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={item.id} className="hover:bg-light-1/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-dark-1 max-w-xs truncate" title={item.opportunity_title}>
                      {item.opportunity_title}
                    </td>
                    <td className="px-6 py-4 text-dark-2 text-xs font-medium">
                      {item.partner_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-dark-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-dark-2/50" />
                        <span>
                          {new Date(item.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - 
                          {' '}{new Date(item.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-2 font-mono text-xs font-bold">
                      Rp {Number(item.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(item.payment_status)}`}>
                        {item.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {item.payment_status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(item.id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Tandai Lunas & Tayangkan"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Hapus Slot"
                      >
                        <XCircle size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 border border-light-2 transform scale-100 transition-transform">
            <div className="flex items-center justify-between pb-2 border-b border-light-2/50">
              <h3 className="text-lg font-bold text-dark-1">Buat Slot Featured Baru</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-light-1 rounded-lg text-dark-2 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Select Opportunity */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark-2 uppercase tracking-wide">
                  Pilih Peluang (Wajib Approved)
                </label>
                <select
                  required
                  value={newListing.opportunity_id}
                  onChange={(e) => setNewListing({ ...newListing, opportunity_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-light-2 rounded-xl bg-light-1/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Dari Daftar --</option>
                  {opportunities.map(opp => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title} 
                      {opp.partner_name ? ` • ${opp.partner_name}` : ''}
                    </option>
                  ))}
                </select>
                
                {opportunities.length === 0 && (
                  <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-xs text-orange-700 dark:text-orange-400 font-medium flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Tidak ada peluang berstatus approved. Setujui dulu di menu Moderasi Peluang.
                    </p>
                  </div>
                )}
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark-2 uppercase tracking-wide">Mulai Tanggal</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={newListing.start_date}
                    onChange={(e) => setNewListing({ ...newListing, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-light-2 rounded-xl bg-light-1/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark-2 uppercase tracking-wide">Selesai Tanggal</label>
                  <input
                    type="date"
                    required
                    min={newListing.start_date}
                    value={newListing.end_date}
                    onChange={(e) => setNewListing({ ...newListing, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-light-2 rounded-xl bg-light-1/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Price Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark-2 uppercase tracking-wide">Harga Sewa (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-2/50 text-sm font-medium">Rp</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="5000"
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2.5 border border-light-2 rounded-xl bg-light-1/50 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="50000"
                  />
                </div>
                <p className="text-[10px] text-dark-2/50 italic">Minimal kelipatan Rp 5.000</p>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3 justify-end border-t border-light-2/50 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-dark-2 hover:bg-light-1 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newListing.opportunity_id}
                  className="px-5 py-2.5 text-sm font-bold text-on-dark bg-primary hover:bg-accent rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Simpan Slot
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}