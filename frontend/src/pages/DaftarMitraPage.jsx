import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch, getStoredUser } from '../lib/api';
import { refreshSession } from '../lib/session';

const partnerTypes = ['EO', 'Perusahaan', 'Lembaga Donor', 'Institusi Pendidikan', 'Lainnya'];

export default function DaftarMitraPage() {
  const [user, setUser] = useState(() => getStoredUser());
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    organization_name: '',
    partner_type: 'EO',
    contact_email: user?.email || '',
    contact_phone: '',
  });

  const loadRequest = async () => {
    try {
      const result = await apiFetch('/api/partners/my-requests');
      setRequest((result.data || [])[0] || null);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getStoredUser()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    refreshSession().then((freshUser) => {
      if (!cancelled && freshUser) setUser(freshUser);
    });
    loadRequest();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        organization_name: formData.organization_name.trim(),
        partner_type: formData.partner_type,
        contact_email: formData.contact_email.trim(),
      };

      if (formData.contact_phone.trim()) payload.contact_phone = formData.contact_phone.trim();

      await apiFetch('/api/partners/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setLoading(true);
      await loadRequest();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40';

  return (
    <section className="min-h-screen w-full px-4 py-24 font-sans bg-light-1">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-accent mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-dark-1 text-2xl md:text-3xl font-bold tracking-tight">Daftar Sebagai Mitra</h1>
          <p className="text-dark-2 text-sm leading-relaxed">
            Mitra yang sudah diverifikasi admin dapat memposting peluang beasiswa, lomba, dan magang.
          </p>
        </div>

        {!user ? (
          <div className="bg-surface p-6 rounded-2xl border border-light-2/50 shadow-sm text-center space-y-4">
            <p className="text-sm text-dark-2">Silakan login terlebih dahulu untuk mengajukan pendaftaran mitra.</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-dark hover:bg-dark-1 hover:text-light-1 transition-colors"
            >
              Login
            </Link>
          </div>
        ) : loading ? (
          <p className="text-center text-sm text-dark-2">Memuat...</p>
        ) : request ? (
          <div className="bg-surface p-6 rounded-2xl border border-light-2/50 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-dark-2/70">Organisasi</p>
                <p className="font-bold text-dark-1">{request.organization_name}</p>
                <p className="text-xs text-dark-2 mt-1">{request.partner_type}</p>
              </div>
              {request.is_verified_partner ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 text-xs font-bold shrink-0">
                  <CheckCircle className="w-3 h-3" /> Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300 text-xs font-bold shrink-0">
                  <Clock className="w-3 h-3" /> Menunggu
                </span>
              )}
            </div>

            {request.is_verified_partner ? (
              <div className="space-y-3">
                <p className="text-sm text-dark-2">
                  Akun kamu sudah menjadi mitra. Kamu bisa mulai mengajukan peluang baru.
                </p>
                <Link
                  to="/bekal?compose=1"
                  className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-dark hover:bg-dark-1 hover:text-light-1 transition-colors"
                >
                  Buat Peluang
                </Link>
              </div>
            ) : (
              <p className="text-sm text-dark-2">
                Pengajuan kamu sedang ditinjau admin. Setelah disetujui, akunmu otomatis menjadi mitra.
              </p>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-surface p-6 rounded-2xl border border-light-2/50 shadow-sm space-y-4"
          >
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-3 rounded-r-lg flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                <p role="alert" className="text-xs text-red-700 dark:text-red-300/90">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-dark-2 mb-1.5">Nama Organisasi *</label>
              <input
                type="text"
                name="organization_name"
                required
                maxLength={150}
                value={formData.organization_name}
                onChange={handleChange}
                placeholder="Nama instansi atau organisasi"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-2 mb-1.5">Jenis Organisasi *</label>
              <select
                name="partner_type"
                value={formData.partner_type}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer appearance-none`}
              >
                {partnerTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-2 mb-1.5">Email Kontak *</label>
                <input
                  type="email"
                  name="contact_email"
                  required
                  maxLength={150}
                  value={formData.contact_email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-2 mb-1.5">Nomor Telepon</label>
                <input
                  type="tel"
                  name="contact_phone"
                  maxLength={20}
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-dark hover:bg-dark-1 hover:text-light-1 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
                  </>
                ) : (
                  'Kirim Pengajuan'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}