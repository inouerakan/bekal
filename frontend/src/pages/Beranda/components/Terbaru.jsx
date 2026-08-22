import { useState } from 'react';
import { Link } from 'react-router-dom';
import PeluangCard from '../../../components/PeluangCard'; // Sesuaikan path import

const opportunities = [
  {
    id: 1, category: 'Beasiswa', title: 'Beasiswa Prestasi Bakti Digital SMK',
    organizer: 'Yayasan Teknologi Indonesia',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: '28 Juni 2080', price: 'Gratis', isPaid: false
  },
  {
    id: 2, category: 'Lomba', title: 'Software Development Competition',
    organizer: 'Himpunan Mahasiswa Komputer',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: '28 Juni 2080', price: 'Rp 50.000 / Tim', isPaid: true
  },
  {
    id: 3, category: 'Karir & Magang', title: 'Junior Web Developer (Magang PKL)',
    organizer: 'Yayasan Teknologi Indonesia',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: '28 Juni 2080', price: 'Gratis', isPaid: false
  },
  {
    id: 4, category: 'Karir & Magang', title: 'Junior Web Developer (Magang PKL)',
    organizer: 'Yayasan Teknologi Indonesia',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: '28 Juni 2080', price: 'Gratis', isPaid: false
  },
  {
    id: 5, category: 'Karir & Magang', title: 'Junior Web Developer (Magang PKL)',
    organizer: 'Yayasan Teknologi Indonesia',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: '28 Juni 2080', price: 'Gratis', isPaid: false
  },
  {
    id: 6, category: 'Karir & Magang', title: 'Junior Web Developer (Magang PKL)',
    organizer: 'Yayasan Teknologi Indonesia',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: '28 Juni 2080', price: 'Gratis', isPaid: false
  }
];

export default function Terbaru() {
  const [activeFilter, setActiveFilter] = useState('Semua');

  const filteredData = activeFilter === 'Semua' 
    ? opportunities 
    : opportunities.filter(item => item.category.includes(activeFilter));

  const filters = ['Semua', 'Beasiswa', 'Karir & Magang', 'Lomba'];

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
          {filteredData.slice(0, 3).map((item) => (
            <PeluangCard key={item.id} data={item} />
          ))}
        </div>

        <div className='self-center'>
            <Link className='bg-primary px-12 py-2 text-light-1 rounded-md border border-light-2 text-sm' to={'/bekal'}>Lihat Selengkapnya</Link>
        </div>

      </div>
    </section>
  );
}