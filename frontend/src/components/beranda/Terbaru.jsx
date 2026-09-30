import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PeluangCard from '../ui/PeluangCard';
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
    <section className="min-h-screen w-full flex items-center justify-center px-4 py-24 font-sans bg-light-1">
      <div className="w-full max-w-7xl flex flex-col gap-12">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-md">
            <h2 className="text-dark-1 text-2xl md:text-3xl font-bold mb-3 tracking-tight capitalize">
              postingan terbaru
            </h2>
            <p className="text-dark-2 text-sm leading-relaxed">
              Jangan lewatkan kesempatan untuk pengembangan dirimu.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {opportunities.slice(0, 3).map((item) => (
            <PeluangCard key={item.id} data={item} />
          ))}
          {!opportunities.length && <p className="col-span-full text-center text-sm text-dark-2">{error || 'Belum ada peluang tersedia.'}</p>}
        </div>

        <div className='self-center'>
            <Link className='bg-primary px-12 py-2 text-on-dark rounded-md border border-light-2 text-sm' to={'/bekal'}>Lihat Selengkapnya</Link>
        </div>

      </div>
    </section>
  );
}