import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setMessage('Cek inbox email Anda untuk instruksi reset password.');
    } catch (err) {
      setError(err.message || 'Gagal mengirim request. Coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-1 p-4">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl border border-light-2/50 overflow-hidden">

        <div className="bg-primary/5 p-6 text-center border-b border-light-2/30">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-dark-1">Lupa Password?</h2>
          <p className="text-sm text-dark-2 mt-1">Masukkan email terdaftar kami akan kirim link reset.</p>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <div className="bg-green-50 dark:bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg flex gap-3 items-start">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-300">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-2 uppercase tracking-wide">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
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
                    Mengirim...
                  </>
                ) : (
                  'Kirim Link Reset'
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-light-2/30">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-dark-2 hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}