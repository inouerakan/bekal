import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaTwitter, FaTwitch } from 'react-icons/fa';
import { X, Lock } from 'lucide-react';
import logo from '../assets/images/logo.png';
import { apiFetch, saveSession } from '../lib/api';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const session = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      saveSession(session);
      navigate('/');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans bg-surface">

      <div className="w-full md:w-1/2 relative bg-primary text-on-dark overflow-hidden flex flex-col">

        <div
          className="absolute inset-0 bg-primary hidden md:block"
          style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
        ></div>
        <div className="absolute inset-0 bg-primary md:hidden"></div>

        <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-10 lg:p-12">

          <div className="flex justify-end">
             <button className="p-1.5 rounded-full hover:bg-on-dark/10 transition-colors text-on-dark md:hidden">
                <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-8">
            <img
              src={logo}
              alt="Bekal Opat Logo"
              className="w-48 md:w-64 lg:w-72 h-auto object-contain drop-shadow-xl"
            />
          </div>

          <div className="space-y-6">

            <div className="text-right hidden md:block">
              <p className="text-xs font-medium opacity-90">+62 895 3437 66050</p>
              <p className="text-xs font-medium opacity-90">bekalopat@gmail.com</p>
            </div>

            <div className="pt-4 border-t border-on-dark/20">
              <h3 className="text-sm font-bold mb-3">Follow Us</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs opacity-80">
                {[
                  { name: 'Instagram', icon: FaInstagram },
                  { name: 'Facebook', icon: FaFacebook },
                  { name: 'Twitter/X', icon: FaTwitter },
                  { name: 'Twitch', icon: FaTwitch }
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="hover:text-on-dark hover:opacity-100 transition-opacity flex items-center gap-1.5"
                  >
                    <social.icon className="w-3 h-3" />
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-surface flex flex-col justify-center items-center p-6 md:p-10 lg:p-16 relative">

        <div className="w-full max-w-sm space-y-6">

          <div className="text-center mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-dark-1 tracking-wide">
              User Login
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>

            <div className="relative">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                placeholder="Username Atau Email"
                className="w-full px-4 py-2.5 rounded-lg bg-light-1 border border-light-2 text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-xs shadow-sm"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                placeholder="Password"
                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-light-1 border border-light-2 text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-xs shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-2/40 hover:text-dark-1 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>

            {error && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}

            <div className="flex items-center justify-between text-xs font-medium text-dark-1 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-light-2 text-primary focus:ring-primary/20" />
                Ingat Saya
              </label>
              <Link to="/forgot-password" className="hover:text-accent transition-colors">
                Lupa Password ?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-primary text-on-dark font-bold text-xs uppercase tracking-wider hover:bg-dark-1 hover:text-light-1 transition-all duration-300 shadow-md mt-2 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? 'Memproses...' : 'Login'}
            </button>

          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-dark-2">Belum punya akun? </span>
            <Link to="/register" className="text-xs font-bold text-accent hover:underline transition-all">
              Create Account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}