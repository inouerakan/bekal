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
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans bg-white">
      
      {/* === LEFT SIDE: Branding === */}
      <div className="w-full md:w-1/2 relative bg-primary text-light-1 overflow-hidden flex flex-col">
        
        {/* Background Diagonal Shape */}
        <div 
          className="absolute inset-0 bg-primary hidden md:block"
          style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
        ></div>
        <div className="absolute inset-0 bg-primary md:hidden"></div>

        {/* Content Wrapper - Padding dikurangi sedikit */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-10 lg:p-12">
          
          {/* Top Spacer / Close Button */}
          <div className="flex justify-end">
             <button className="p-1.5 rounded-full hover:bg-light-1/10 transition-colors text-light-1 md:hidden">
                <X className="w-5 h-5" />
             </button>
          </div>

          {/* Logo Area */}
          <div className="flex-1 flex items-center justify-center py-8">
            <img 
              src={logo} 
              alt="Bekal Opat Logo" 
              className="w-48 md:w-64 lg:w-72 h-auto object-contain drop-shadow-xl"
            />
          </div>

          {/* Bottom Section: Contact & Socials */}
          <div className="space-y-6">
            
            {/* Contact Info - Text lebih kecil */}
            <div className="text-right hidden md:block">
              <p className="text-xs font-medium opacity-90">+62 895 3437 66050</p>
              <p className="text-xs font-medium opacity-90">bekalopat@gmail.com</p>
            </div>

            {/* Divider & Socials */}
            <div className="pt-4 border-t border-light-1/20">
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
                    className="hover:text-light-1 hover:opacity-100 transition-opacity flex items-center gap-1.5"
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

      {/* === RIGHT SIDE: Login Form === */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-6 md:p-10 lg:p-16 relative">
        
        {/* Close Button Desktop */}
        {/* <button className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-dark-2 hidden md:block">
          <X className="w-5 h-5" />
        </button> */}

        <div className="w-full max-w-sm space-y-6">
          
          {/* Header - Ukuran dikurangi */}
          <div className="text-center mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-dark-1 tracking-wide">
              User Login
            </h2>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Username/Email Input - Text & Padding dikurangi */}
            <div className="relative">
              <input 
                type="text" 
                name="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                placeholder="Username Atau Email" 
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-xs shadow-sm"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                placeholder="Password" 
                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-gray-50 border border-gray-100 text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-xs shadow-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-2/40 hover:text-dark-1 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>

            {error && <p className="text-xs text-red-600" role="alert">{error}</p>}

            {/* Options Row - Text xs */}
            <div className="flex items-center justify-between text-xs font-medium text-dark-1 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary/20" />
                Ingat Saya
              </label>
              <a href="#" className="hover:text-primary transition-colors">
                Lupa Password ?
              </a>
            </div>

            {/* Submit Button - Text xs, padding dikurangi */}
            <button 
              type="submit"
              className="w-full py-2.5 rounded-full bg-primary text-light-1 font-bold text-xs uppercase tracking-wider hover:bg-dark-1 transition-all duration-300 shadow-md mt-2 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? 'Memproses...' : 'Login'}
            </button>

          </form>

          {/* Footer Link - Text xs */}
          <div className="text-center pt-2">
            <span className="text-xs text-dark-2">Belum punya akun? </span>
            <Link to="/register" className="text-xs font-bold text-primary hover:underline transition-all">
              Create Account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}