import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, School, ShieldCheck, Loader2, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { apiFetch, getStoredUser, saveSession } from '../lib/api';
import { refreshSession } from '../lib/session';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', school_name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const freshUser = await refreshSession();
        if (!cancelled) {
          if (!freshUser) { navigate('/login'); return; }
          setUser(freshUser);
          setFormData({
            full_name: freshUser.full_name || '',
            school_name: freshUser.school_name || '',
            phone: freshUser.phone || '',
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProfile();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const result = await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      // Update session lokal dengan data terbaru
      const currentUser = getStoredUser();
      if (currentUser && result.data) {
        const updatedSession = {
          ...currentUser,
          full_name: result.data.full_name,
          school_name: result.data.school_name,
          phone: result.data.phone,
        };
        saveSession({ data: updatedSession, token: currentUser.token });
        setUser(result.data);
        window.dispatchEvent(new Event('bekal-auth-change'));
      }

      setSuccess('Profil berhasil diperbarui!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-1 pt-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-3 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40 transition-all';

  return (
    <section className="min-h-screen w-full px-4 py-24 font-sans bg-light-1">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-accent mx-auto border-2 border-primary/20">
            <span className="text-2xl font-bold">
              {(user?.full_name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-dark-1 text-2xl md:text-3xl font-bold tracking-tight">Profil Saya</h1>
          <p className="text-dark-2 text-sm">Kelola informasi akun dan data diri Anda.</p>
        </div>

        {/* Info Card (Read-only) */}
        <div className="bg-surface p-6 rounded-2xl border border-light-2/50 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-dark-2 uppercase tracking-wide border-b border-light-2 pb-2">Informasi Akun</h2>
          
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-dark-2/50 shrink-0" />
            <div>
              <p className="text-[10px] text-dark-2/70 font-semibold uppercase">Email</p>
              <p className="text-sm font-medium text-dark-1">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-dark-2/50 shrink-0" />
            <div>
              <p className="text-[10px] text-dark-2/70 font-semibold uppercase">Role & Status</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-accent text-xs font-bold capitalize">
                  {user?.role?.replace('_', ' ')}
                </span>
                {user?.is_verified ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                    <CheckCircle className="w-3 h-3" /> Terverifikasi
                  </span>
                ) : (
                  <span className="text-xs text-dark-2/50">Belum diverifikasi</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-2xl border border-light-2/50 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-dark-2 uppercase tracking-wide border-b border-light-2 pb-2">Edit Data Diri</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-3 rounded-r-lg flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300/90">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-500/10 border-l-4 border-green-500 p-3 rounded-r-lg flex gap-3 items-start">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-green-700 dark:text-green-300/90">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-2 mb-1.5">Nama Lengkap *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-2/40" />
                <input
                  type="text"
                  name="full_name"
                  required
                  maxLength={150}
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-2 mb-1.5">Nama Sekolah / Institusi</label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-2/40" />
                <input
                  type="text"
                  name="school_name"
                  maxLength={150}
                  value={formData.school_name}
                  onChange={handleChange}
                  placeholder="Contoh: SMAN 1 Bandung"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-2 mb-1.5">Nomor Telepon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-2/40" />
                <input
                  type="tel"
                  name="phone"
                  maxLength={20}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-dark hover:bg-dark-1 hover:text-light-1 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" /> Simpan Perubahan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}