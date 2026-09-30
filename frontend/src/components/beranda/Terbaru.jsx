import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PeluangCard from '../ui/PeluangCard'; // Sesuaikan path import
import { apiFetch } from '../../lib/api';

export default function Terbaru() {
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/opportunities?page=1&limit=3&sort=newest')
      .then((result) => setOpportunities(result.data || []))
      .catch((fetchError) => setError(fetchError.message));
  }, []);

  return (
    // 1. Full Screen Container dengan Flex Centering
    <section className="min-h-screen w-full flex items-center justify-center px-4 py-24 font-sans bg-light-1">
      
      {/* 2. Content Wrapper dengan Flex Column & Gap */}
      <div className="w-full max-w-7xl flex flex-col gap-12">
        
        {/* Header Section: Menggunakan flex untuk jarak antar elemen */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-md">
            <h2 className="text-dark-1 text-2xl md:text-3xl font-bold mb-3 tracking-tight capitalize">
              postingan terbaru
            </h2>
            <p className="text-dark-2 text-sm leading-relaxed">
              Jangan lewatkan kesempatan untuk pengembangan dirimu.
            </p>
          </div>

          {/* Filter Tabs */}
          {/* <div className="flex flex-wrap gap-1 bg-light-1 p-1 rounded-full border border-light-2/30 shadow-sm self-start md:self-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-primary text-light-1 shadow-md'
                    : 'text-dark-2 hover:bg-light-2/20 hover:text-dark-1'
                }`}
              >
                {filter}
              </button>
            ))}
          </div> */}
        </div>

        {/* Grid Cards Loop - Terlimit 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {opportunities.slice(0, 3).map((item) => (
            <PeluangCard key={item.id} data={item} />
          ))}
          {!opportunities.length && <p className="col-span-full text-center text-sm text-dark-2">{error || 'Belum ada peluang tersedia.'}</p>}
        </div>

        <div className='self-center'>
            <Link className='bg-primary px-12 py-2 text-light-1 rounded-md border border-light-2 text-sm' to={'/bekal'}>Lihat Selengkapnya</Link>
        </div>

      </div>
    </section>
  );
}
