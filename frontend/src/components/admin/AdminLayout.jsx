import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, ClipboardList, MessageSquare,
  LogOut, Menu, X, ShieldCheck, Tags
} from 'lucide-react';
import { clearSession, getStoredUser } from '../../lib/api';
import ThemeToggle from '../ui/ThemeToggle';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-1">
        <div className="text-center p-8 bg-surface rounded-2xl shadow-lg border border-red-100 dark:border-red-500/30 max-w-md">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dark-1 mb-2">Akses Ditolak</h2>
          <p className="text-dark-2 text-sm mb-6">Anda harus login sebagai administrator untuk mengakses halaman ini.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-primary text-on-dark rounded-full font-semibold hover:bg-dark-1 hover:text-light-1 transition-colors"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manajemen User', path: '/admin/users', icon: Users },
    { name: 'Verifikasi Partner', path: '/admin/partners', icon: Briefcase },
    { name: 'Moderasi Peluang', path: '/admin/opportunities', icon: ClipboardList },
    { name: 'Kategori', path: '/admin/categories', icon: Tags },
    { name: 'Moderasi Forum', path: '/admin/forum', icon: MessageSquare },
  ];

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-light-1 text-dark-1 font-sans">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Always Fixed */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-sidebar text-on-dark z-50 transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-on-dark/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-on-dark" />
            </div>
            <span className="font-bold text-lg tracking-tight">Bekal Admin</span>
            <ThemeToggle />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-on-dark/70 hover:text-on-dark">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-on-dark shadow-lg shadow-primary/20'
                    : 'text-on-dark/70 hover:bg-on-dark/10 hover:text-on-dark'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-on-dark/10 bg-sidebar">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-on-dark/20 flex items-center justify-center text-xs font-bold">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.full_name}</p>
              <p className="text-[10px] text-on-dark/50 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content - Added md:ml-64 to offset fixed sidebar */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="md:hidden sticky top-0 z-30 bg-light-1 border-b border-light-2/50 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-dark-1">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-dark-1">Admin Panel</span>
          <div className="w-6"></div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}