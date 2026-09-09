import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaTwitter, FaTwitch } from 'react-icons/fa';
import { X, User, IdCard, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/images/logo.png';
import { apiFetch, saveSession } from '../../lib/api';

function InputField({ type, name, value, onChange, placeholder, icon: Icon, fullWidth = false }) {
  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder} 
        className="w-full px-4 py-2.5 pr-10 rounded-lg bg-gray-50 border-b border-dotted border-gray-300 text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all text-xs shadow-sm"
      />
      {Icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-2/40">
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', first_name: '', last_name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (name) => (event) => {
    setFormData((current) => ({ ...current, [name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const session = await apiFetch('/api/auth/register', {
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
      
      {/* === LEFT SIDE: Branding (Sama seperti Login) === */}
      <div className="w-full md:w-1/2 relative bg-primary text-light-1 overflow-hidden flex flex-col">
        
        {/* Background Diagonal Shape */}
        <div 
          className="absolute inset-0 bg-primary hidden md:block"
          style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
        ></div>
        <div className="absolute inset-0 bg-primary md:hidden"></div>

        <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-10 lg:p-12">
          
          <div className="flex justify-end">
             <button className="p-1.5 rounded-full hover:bg-light-1/10 transition-colors text-light-1 md:hidden">
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

      {/* === RIGHT SIDE: Register Form === */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-6 md:p-10 lg:p-16 relative overflow-y-auto">
        
        {/* Close Button Desktop */}
        {/* <button className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-dark-2 hidden md:block z-10">
          <X className="w-5 h-5" />
        </button> */}

        <div className="w-full max-w-md space-y-6 my-8">
          
          {/* Header */}
          <div className="text-center mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-dark-1 tracking-wide">
              Create Account
            </h2>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Username (Full Width) */}
            <InputField 
              type="text" 
              name="full_name"
              value={formData.full_name}
              onChange={updateField('full_name')}
              placeholder="Nama Lengkap" 
              icon={User} 
              fullWidth 
            />

            {/* Row: Nama Depan & Nama Belakang */}
            <div className="grid grid-cols-2 gap-3">
              <InputField 
                type="text" 
                name="first_name"
                value={formData.first_name}
                onChange={updateField('first_name')}
                placeholder="Nama Depan" 
                icon={IdCard} 
              />
              <InputField 
                type="text" 
                name="last_name"
                value={formData.last_name}
                onChange={updateField('last_name')}
                placeholder="Nama Belakang" 
                icon={IdCard} 
              />
            </div>

            {/* Row: No Telepon & Email */}
            <div className="grid grid-cols-2 gap-3">
              <InputField 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={updateField('phone')}
                placeholder="No Telepon" 
                icon={Phone} 
              />
              <InputField 
                type="email" 
                name="email"
                value={formData.email}
                onChange={updateField('email')}
                placeholder="Email" 
                icon={Mail} 
              />
            </div>

            {/* Password (Full Width) with Toggle */}
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={updateField('password')}
                placeholder="Password" 
                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-gray-50 border-b border-dotted border-gray-300 text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all text-xs shadow-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-2/40 hover:text-dark-1 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="text-xs text-red-600" role="alert">{error}</p>}

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full py-2.5 rounded-full bg-light-2 text-dark-1 font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-light-1 transition-all duration-300 shadow-md mt-4 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? 'Memproses...' : 'Sign Up'}
            </button>

          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-dark-2">Login Jika Memiliki Akun </span>
            <Link to="/login" className="text-xs font-bold text-primary hover:underline transition-all ml-1">
              Login
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}   