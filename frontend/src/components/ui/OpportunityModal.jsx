import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { apiFetch, getStoredUser } from '../../lib/api';

export default function OpportunityModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    organizer_name: '',
    description: '',
    requirements: '',
    education_level: '',
    location: '',
    cost: '',
    registration_link: '',
    deadline: ''
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchCategories();
    } else {
      document.body.style.overflow = 'unset';
      resetForm();
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const result = await apiFetch('/api/categories');
      setCategories(result.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category_id: '',
      organizer_name: '',
      description: '',
      requirements: '',
      education_level: '',
      location: '',
      cost: '',
      registration_link: '',
      deadline: ''
    });
    setError(null);
    setSuccess(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !['admin', 'guru_BK'].includes(user.role)) {
      setError('Akses ditolak.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : null
      };

      delete payload.cost;
      if (formData.cost && formData.cost.trim() !== '') {
        payload.cost = formData.cost;
      }

      await apiFetch('/api/opportunities', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Gagal mengirim data. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-2xl bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">

        <div className="flex items-center justify-between px-6 py-4 border-b border-light-2/50 bg-light-1/30 shrink-0">
          <h2 className="text-xl font-bold text-dark-1">Ajukan Informasi Peluang Baru</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-light-2 rounded-full transition-colors text-dark-2"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar">

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 dark:text-red-300 text-sm">Terjadi Kesalahan</h4>
                <p className="text-red-700 dark:text-red-300/90 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg flex gap-3 items-start">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-green-800 dark:text-green-300 text-sm">Berhasil Dikirim!</h4>
                <p className="text-green-700 dark:text-green-300/90 text-xs mt-1">Data sedang menunggu verifikasi admin.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} id="opportunity-form" className="space-y-6">

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-dark-2 uppercase tracking-wide border-b border-light-2 pb-2">Informasi Dasar</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-dark-2 mb-1.5">Judul Peluang *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Contoh: Beasiswa S1 Luar Negeri 2026"
                    className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-2 mb-1.5">Kategori *</label>
                  <select
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-2 mb-1.5">Penyelenggara *</label>
                  <input
                    type="text"
                    name="organizer_name"
                    required
                    value={formData.organizer_name}
                    onChange={handleChange}
                    placeholder="Nama Instansi/Organisasi"
                    className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-dark-2 uppercase tracking-wide border-b border-light-2 pb-2">Detail & Persyaratan</h3>

              <div>
                <label className="block text-xs font-semibold text-dark-2 mb-1.5">Deskripsi Singkat *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan manfaat, cakupan, dan informasi penting lainnya..."
                  className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-dark-2/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-2 mb-1.5">Persyaratan Khusus</label>
                <textarea
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="IPK minimal, usia, domisili, dll. (Opsional)"
                  className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-dark-2/40"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-dark-2 uppercase tracking-wide border-b border-light-2 pb-2">Logistik & Pendaftaran</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-2 mb-1.5">Deadline Pendaftaran *</label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-2 mb-1.5">Jenjang Pendidikan</label>
                  <select
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none"
                  >
                    <option value="">Semua Jenjang</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Sarjana">Sarjana (S1)</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-2 mb-1.5">Lokasi / Wilayah</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Contoh: Nasional, Bandung, Online"
                    className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-2 mb-1.5">Biaya Pendaftaran</label>
                  <input
                    type="text"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="Gratis / Rp 50.000"
                    className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-dark-2 mb-1.5">Link Registrasi / Website Resmi</label>
                  <input
                    type="url"
                    name="registration_link"
                    value={formData.registration_link}
                    onChange={handleChange}
                    placeholder="https://example.com/register"
                    className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-light-2/50 bg-light-1/30 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-dark-2 hover:bg-light-2 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="opportunity-form"
            disabled={isLoading || success}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-dark hover:bg-dark-1 hover:text-light-1 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Terkirim
              </>
            ) : (
              'Kirim Permohonan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}