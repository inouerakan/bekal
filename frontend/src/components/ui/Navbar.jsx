import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/images/logo_blue.png';
import { clearSession, getStoredUser } from '../../lib/api';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());
  const location = useLocation();

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    window.addEventListener('bekal-auth-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('bekal-auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const canApplyPartner = Boolean(user) && ['siswa', 'guru_BK'].includes(user.role);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Bekal', path: '/bekal' },
    { name: 'Forum', path: '/forum' },
    ...(canApplyPartner ? [{ name: 'Jadi Mitra', path: '/daftar-mitra' }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4 font-sans">
      <div className="max-w-7xl mx-auto bg-light-1/60 backdrop-blur-sm border-2 border-light-2/20 rounded-2xl flex items-center justify-between px-6 py-3 transition-all duration-300">


        <div className="hidden md:flex items-center gap-2 p-1 rounded-full">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-primary text-on-dark shadow-sm'
                  : 'text-dark-2 hover:text-dark-1 hover:bg-light-1'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            {user ? <>
              <Link 
                to="/profil" 
                className="text-xs text-dark-1 hover:text-accent font-medium transition-colors"
              >
                {user.full_name || user.email}
              </Link>
              <button onClick={clearSession} className="px-4 py-1.5 text-xs font-semibold rounded-full bg-dark-1 text-light-1 hover:bg-primary hover:text-on-dark">
                Keluar
              </button>
            </> : <>
            <Link
              to="/login"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-colors ${
                isActive('/login') ? 'bg-primary text-on-dark' : 'bg-dark-1 text-light-1 hover:bg-primary hover:text-on-dark'
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-colors ${
                isActive('/register')
                  ? 'bg-primary text-on-dark'
                  : 'bg-dark-1 text-light-1 hover:bg-primary hover:text-on-dark'
              }`}
            >
              Register
            </Link>
            </>}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-dark-1 hover:bg-light-2/20 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto bg-light-1 border border-light-2/20 rounded-2xl shadow-xl p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="px-4 py-3 rounded-xl text-sm font-medium text-dark-2 hover:bg-light-2/10 hover:text-dark-1 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="h-px bg-light-2/20 my-2"></div>
          <div className="flex flex-col gap-2">
            {user ? <>
              <Link 
                to="/profil" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-sm text-dark-1 hover:text-accent font-medium transition-colors"
              >
                {user.full_name || user.email}
              </Link>
              <button onClick={() => { clearSession(); setIsMobileMenuOpen(false); }} className="px-4 py-3 rounded-xl text-sm font-medium bg-dark-1 text-light-1 text-center">
                Keluar
              </button>
            </> : <>
            <Link
              to="/login"
              className="px-4 py-3 rounded-xl text-sm font-medium text-dark-1 text-center border border-light-2/20"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-3 rounded-xl text-sm font-medium bg-primary text-on-dark text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Register
            </Link>
            </>}
          </div>
        </div>
      )}
    </nav>
  );
}