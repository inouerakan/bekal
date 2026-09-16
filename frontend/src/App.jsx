// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Beranda from './pages/Beranda';
import Navbar from './components/ui/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Forum from './pages/Forum';
import Bekal from './pages/Bekal';
import PeluangDetail from './pages/PeluangDetail';
import ForumDetail from './pages/ForumDetail'; // Import komponen baru

function App() {
  return (
    <Router>
      <div className='bg-light-1 min-h-screen font-sans'>
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forum" element={<Forum />} />
            
            {/* Rute Detail Forum (Dynamic) */}
            <Route path="/forum/:id" element={<ForumDetail />} />
            
            <Route path="/bekal" element={<Bekal />} />
            <Route path="/bekal/:id" element={<PeluangDetail />} />

            <Route path="*" element={
              <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-2xl text-dark-1">Halaman Tidak Ditemukan</h1>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;