// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Beranda from './pages/Beranda/Beranda';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginRegister/LoginPage';
import RegisterPage from './pages/LoginRegister/RegisterPage';
import Forum from './pages/Forum/Forum';
import Bekal from './pages/Bekal/Bekal';

function App() {
  return (
    <Router>
      <div className='bg-light-1 min-h-screen font-sans'>
        {/* Navbar selalu muncul di semua halaman */}
        <Navbar />
        
        {/* Container untuk konten halaman */}
        <main>
          <Routes>
            {/* Rute Beranda */}
            <Route path="/" element={<Beranda />} />
            
            {/* Rute Login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rute Register */}
            <Route path="/register" element={<RegisterPage />} />

            {/* Rute Forum */}
            <Route path="/forum" element={<Forum />} />
            
            {/* Rute Bekal */}
            <Route path="/bekal" element={<Bekal />} />

            {/* Rute 404 (Opsional) */}
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