import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import PeluangCard from '../ui/PeluangCard';

export default function FeaturedSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/featured') 
      .then(res => {
        if (res.success && res.data) {
          setItems(res.data);
        } else {
          setItems([]);
        }
      })
      .catch(err => {
        console.error("Gagal load featured:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // JIKA LOADING ATAU DATA KOSONG, SECTION TIDAK MUNCUL SAMA SEKALI
  if (loading || items.length === 0) return null; 

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* HEADER SECTION - Disamakan strukturnya dengan Terbaru */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-2">
             <Sparkles size={18} className="text-yellow-500" />
             <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Sponsored</span>
          </div>
          <h2 className="text-dark-1 dark:text-white text-2xl md:text-3xl font-bold mb-3 tracking-tight capitalize">
            Peluang Unggulan
          </h2>
          <p className="text-dark-2 dark:text-gray-400 text-sm leading-relaxed">
            Informasi prioritas dari mitra resmi kami yang telah membayar biaya promosi untuk visibilitas lebih tinggi.
          </p>
        </div>
        
        {/* Tombol aksi opsional, atau bisa dihapus jika tidak perlu link ke halaman khusus sponsored */}
        <Link 
          to="/bekal?filter=featured" 
          className="inline-flex items-center gap-2 text-primary hover:text-accent font-semibold text-sm transition-colors"
        >
          Lihat Semua Iklan
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          Gagal memuat data unggulan: {error}
        </div>
      )}

      {/* GRID CARDS - Struktur Grid Identik dengan Terbaru */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.slice(0, 3).map((item) => {
          // Mapping data backend featured ke format prop PeluangCard
          const cardData = {
            id: item.opportunity_id || item.id,
            title: item.opportunity_title || item.title,
            description: item.opportunity_description || item.description,
            image_url: item.opportunity_image_url || item.image_url,
            deadline: item.opportunity_deadline || item.deadline,
            location: item.opportunity_location || item.location,
            category_name: item.category_name || 'Umum',
            organizer_name: item.partner_name || item.organizer_name
          };

          return (
            <PeluangCard 
              key={`feat-${cardData.id}`} 
              data={cardData} 
              isFeatured={true} // Tetap gunakan prop ini agar kartu punya badge kuning "Sponsored"
            />
          );
        })}
      </div>
    </section>
  );
}