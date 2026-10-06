import Hero from '../components/beranda/Hero';
import FeaturedSection from '../components/beranda/FeaturedSection'; // IMPORT BARU
import Terbaru from '../components/beranda/Terbaru';
import Footer from '../components/ui/Footer';

export default function Beranda() {
  return (
    <div className="min-h-screen bg-light-1 dark:bg-gray-900">
      <Hero />
      
      {/* PANGGIL KOMPONEN DI SINI */}
      <FeaturedSection /> 
      
      <Terbaru />
      <Footer />
    </div>
  );
}