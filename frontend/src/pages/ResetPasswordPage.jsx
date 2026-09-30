import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ShieldAlert, CheckCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError('Link reset tidak valid. Silakan coba lagi dari halaman Lupa Password.');
    }
  }, [token, email]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          email,
          new_password: formData.password
        })
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Gagal mereset password. Token mungkin sudah kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-1 p-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl border border-red-100 dark:border-red-500/30 p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dark-1 mb-2">Akses Ditolak</h2>
          <p className="text-dark-2 text-sm mb-6">Parameter URL tidak lengkap.</p>
          <Link to="/forgot-password" className="text-accent font-bold hover:underline text-sm">
            Minta Ulang Link Reset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-1 p-4">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl border border-light-2/50 overflow-hidden">

        <div className="bg-primary/5 p-6 text-center border-b border-light-2/30">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-dark-1">Atur Password Baru</h2>
          <p className="text-sm text-dark-2 mt-1">Untuk akun: <span className="font-semibold text-dark-1">{email}</span></p>
        </div>

        <div className="p-6 space-y-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-dark-1 mb-2">Berhasil!</h3>
              <p className="text-sm text-dark-2">Password telah diubah. Anda akan dialihkan ke halaman login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-semibold text-dark-2 uppercase tracking-wide">Password Baru</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter & angka"
                    className="w-full px-4 py-3 pr-10 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] -translate-y-1/2 text-dark-2/40 hover:text-dark-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-2 uppercase tracking-wide">Konfirmasi Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password baru"
                    className="w-full px-4 py-3 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-dark-1 text-light-1 font-bold text-sm hover:bg-primary hover:text-on-dark transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Simpan Password Baru'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}