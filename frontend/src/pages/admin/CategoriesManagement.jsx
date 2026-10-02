import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, X, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const emptyForm = { name: '', slug: '', description: '' };

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await apiFetch('/api/categories');
      setCategories(result.data || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setError('');
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (formData.slug.trim()) payload.slug = formData.slug.trim();

      if (editingId) {
        await apiFetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      fetchCategories();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Hapus kategori "${category.name}"?`)) return;
    try {
      await apiFetch(`/api/categories/${category.id}`, { method: 'DELETE' });
      if (editingId === category.id) resetForm();
      fetchCategories();
    } catch (deleteError) {
      alert('Gagal menghapus: ' + deleteError.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-1">Kategori Peluang</h1>
          <p className="text-dark-2 text-sm">Tambah dan kelola kategori untuk beasiswa, lomba, magang, dan lainnya.</p>
        </div>
        <button
          onClick={fetchCategories}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-light-2 rounded-lg text-dark-1 hover:bg-light-1 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface p-6 rounded-2xl border border-light-2/50 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-dark-2 uppercase tracking-wide">
            {editingId ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1 text-xs font-semibold text-dark-2 hover:text-dark-1"
            >
              <X className="w-4 h-4" /> Batal ubah
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-dark-2 mb-1.5">Nama Kategori *</label>
            <input
              type="text"
              name="name"
              required
              maxLength={50}
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Beasiswa"
              className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-2 mb-1.5">Slug (opsional)</label>
            <input
              type="text"
              name="slug"
              maxLength={50}
              value={formData.slug}
              onChange={handleChange}
              placeholder="Dibuat otomatis dari nama bila kosong"
              className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-dark-2 mb-1.5">Deskripsi (opsional)</label>
            <input
              type="text"
              name="description"
              maxLength={255}
              value={formData.description}
              onChange={handleChange}
              placeholder="Penjelasan singkat kategori"
              className="w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-dark hover:bg-dark-1 hover:text-light-1 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </>
            ) : editingId ? (
              'Simpan Perubahan'
            ) : (
              <>
                <Plus className="w-4 h-4" /> Tambah Kategori
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-surface rounded-2xl border border-light-2/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-light-1/50 text-dark-2 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-2/30">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-dark-2/50">Memuat data...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-dark-2/50">Belum ada kategori.</td></tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-light-1/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-dark-1">{category.name}</td>
                    <td className="px-6 py-4 text-dark-2 font-mono text-xs">{category.slug}</td>
                    <td className="px-6 py-4 text-dark-2/80">{category.description || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Ubah"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}