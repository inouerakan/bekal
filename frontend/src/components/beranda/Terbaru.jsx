import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PeluangCard from '../ui/PeluangCard';
import { apiFetch } from '../../lib/api';

export default function Terbaru() {
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    apiFetch('/api/opportunities?page=1&limit=6&sort=newest')
      .then((result) => setOpportunities(result.data || []))
      .catch((fetchError) => setError(fetchError.message));
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-md">
          <h2 className="text-dark-1 dark:text-white text-2xl md:text-3xl font-bold mb-3 tracking-tight capitalize">
            Postingan Terbaru
          </h2>
          <p className="text-dark-2 dark:text-gray-400 text-sm leading-relaxed">
            Jangan lewatkan kesempatan untuk pengembangan dirimu. Informasi terbaru langsung dari sumber tepercaya.
          </p>
        </div>
        <Link 
          to="/bekal" 
          className="inline-flex items-center gap-2 text-primary hover:text-accent font-semibold text-sm transition-colors"
        >
          Lihat Semua Peluang
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          Gagal memuat data: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {opportunities.length > 0 ? (
          opportunities.map((item) => (
            <PeluangCard key={item.id} data={item} isFeatured={false} />
          ))
        ) : (
          !error && Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-96 animate-pulse bg-light-2 dark:bg-gray-800 rounded-2xl"></div>
          ))
        )}
      </div>
    </section>
  );
}