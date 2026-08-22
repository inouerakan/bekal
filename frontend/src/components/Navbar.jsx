// Navbar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Hapus Search & Bell dari import
import logo from '../assets/images/logo_blue.png';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Helper untuk cek apakah link sedang aktif
  const isActive = (path) => location.pathname === path;

  // Definisi Menu Navigasi Sesuai Permintaan
  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Bekal', path: '/bekal' }, // Asumsi 'Bekal' mengarah ke halaman katalog/beasiswa
    { name: 'Forum', path: '/forum' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4 font-sans">
      <div className="max-w-7xl mx-auto bg-light-1/60 backdrop-blur-sm border-2 border-light-2/20 rounded-2xl flex items-center justify-between px-6 py-3 transition-all duration-300">
        
        {/* 1. Logo - Gunakan Link ke beranda */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group shrink-0">
          <img 
            src={logo} 
            alt="Bekal Opat Logo" 
            className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* 2. Navigation Links (Desktop) - Hanya Beranda, Bekal, Forum */}
        <div className="hidden md:flex items-center gap-2 p-1 rounded-full">
          {navLinks.map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-primary text-light-1 shadow-sm' 
                  : 'text-dark-2 hover:text-dark-1 hover:bg-light-1'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* 3. Actions (Kanan) - Tanpa Search/Bell */}
        <div className="flex items-center gap-3">
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/login" 
              className={`px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-colors ${
                isActive('/login') ? 'bg-primary text-light-1' : 'bg-dark-1 text-light-1 hover:bg-primary'
              }`}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={`px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-colors ${
                isActive('/register') 
                  ? 'bg-primary text-light-1' 
                  : 'bg-dark-1 text-light-1 hover:bg-primary'
              }`}
            >
              Register
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-dark-1 hover:bg-light-2/20 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
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
            <Link 
              to="/login" 
              className="px-4 py-3 rounded-xl text-sm font-medium text-dark-1 text-center border border-light-2/20"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-3 rounded-xl text-sm font-medium bg-primary text-light-1 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}