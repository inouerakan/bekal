import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/ui/Navbar';
import Beranda from './pages/Beranda';
import Bekal from './pages/Bekal';
import Forum from './pages/Forum';
import ForumDetail from './pages/ForumDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Profile from './pages/Profile';
import DaftarMitraPage from './pages/DaftarMitraPage';
import PeluangDetail from './pages/PeluangDetail';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/UsersManagement';
import PartnersManagement from './pages/admin/PartnersManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import OpportunitiesModeration from './pages/admin/OpportunitiesModeration';
import ForumModeration from './pages/admin/ForumModeration';
import FeaturedManagement from './pages/admin/FeaturedManagement';

function PublicWrapper() {
  return (
    <div className='bg-light-1 text-dark-1 min-h-screen font-sans transition-colors duration-300'>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<PublicWrapper />}>
            <Route path="/" element={<Beranda />} />
            <Route path="/bekal" element={<Bekal />} />
            <Route path="/bekal/:id" element={<PeluangDetail />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/:id" element={<ForumDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/daftar-mitra" element={<DaftarMitraPage />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="partners" element={<PartnersManagement />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="opportunities" element={<OpportunitiesModeration />} />
            <Route path="forum" element={<ForumModeration />} />
            <Route path="featured" element={<FeaturedManagement />} />
          </Route>

          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen bg-light-1">
              <h1 className="text-2xl text-dark-1">Halaman Tidak Ditemukan</h1>
            </div>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;