import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import PeluangCard from '../components/ui/PeluangCard';
import OpportunityModal from '../components/ui/OpportunityModal';
import { apiFetch, getStoredUser } from '../lib/api';

export default function Bekal() {
  const [searchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(() => searchParams.get('compose') === '1');

  const user = getStoredUser();
  const canSubmit = user && ['admin', 'guru_BK'].includes(user.role);

  const filters = ['Semua', ...categories.map((category) => category.name)];

  useEffect(() => {
    apiFetch('/api/categories')
      .then((result) => {
        const availableCategories = result.data || [];
        setCategories(availableCategories);
      })
      .catch((fetchError) => setError(fetchError.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const selectedCategory = categories.find((category) =>
      category.name.toLowerCase().includes(activeFilter.toLowerCase())
    );

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(itemsPerPage),
      search: searchQuery,
    });

    if (activeFilter !== 'Semua' && selectedCategory) {
      params.set('category_id', selectedCategory.id);
    }

    apiFetch(`/api/opportunities?${params}`)
      .then((result) => {
        if (!cancelled) {
          setOpportunities(result.data || []);
          setTotalPages(result.pagination?.totalPages || 1);
          setError('');
        }
      })
      .catch((fetchError) => {
        if (!cancelled) setError(fetchError.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeFilter, currentPage, searchQuery, categories]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const currentOpportunities = opportunities;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <section className="min-h-screen w-full px-4 py-24 font-sans bg-light-1 relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          <div className="space-y-3">
            <h1 className="text-dark-1 text-3xl md:text-4xl font-bold tracking-tight">
              Katalog Bekal Opat
            </h1>
            <p className="text-dark-2 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Temukan ribuan peluang beasiswa, lomba, dan magang terverifikasi untuk masa depanmu.
              Semua informasi dalam satu genggaman.
            </p>
          </div>

          <div className="w-full max-w-xl relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 to-primary/5 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-surface rounded-full shadow-lg border-2 border-light-2/40 p-1.5 pl-5 transition-all group-focus-within:border-primary/30 group-focus-within:shadow-xl">
              <Search className="w-5 h-5 text-dark-2/40 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Cari beasiswa, lomba, atau magang..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-transparent border-none py-2.5 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none"
              />
              <button className="bg-primary hover:bg-dark-1 text-on-dark hover:text-light-1 p-2.5 rounded-full transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                  activeFilter === filter
                    ? 'bg-primary text-on-dark border-primary shadow-md'
                    : 'bg-surface text-dark-2 border-light-2/30 hover:bg-light-2/20 hover:text-dark-1'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {canSubmit && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-dark-1 text-light-1 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary hover:text-on-dark transition-colors shadow-md mt-2"
            >
              <Plus className="w-4 h-4" />
              Ajukan Informasi Baru
            </button>
          )}
        </div>

        {error && <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-100">
          {isLoading ? (
            <p className="col-span-full text-center text-sm text-dark-2">Memuat peluang...</p>
          ) : currentOpportunities.length > 0 ? (
            currentOpportunities.map((item) => (
              <PeluangCard key={item.id} data={item} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-surface rounded-2xl border border-dashed border-light-2">
              <div className="w-12 h-12 bg-light-1 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-dark-2/20" />
              </div>
              <h3 className="text-dark-1 font-bold text-sm">Peluang tidak ditemukan</h3>
              <p className="text-dark-2 text-xs mt-1">Coba kata kunci atau kategori lain.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pb-8">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === 1
                  ? 'border-light-2/20 text-dark-2/30 cursor-not-allowed bg-transparent'
                  : 'border-light-2/30 text-dark-2 hover:bg-surface hover:border-primary/30 hover:text-accent bg-surface shadow-sm'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    currentPage === number
                      ? 'bg-primary text-on-dark shadow-md scale-105'
                      : 'bg-surface text-dark-2 border border-light-2/30 hover:bg-light-2/20 hover:text-dark-1'
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === totalPages
                  ? 'border-light-2/20 text-dark-2/30 cursor-not-allowed bg-transparent'
                  : 'border-light-2/30 text-dark-2 hover:bg-surface hover:border-primary/30 hover:text-accent bg-surface shadow-sm'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && canSubmit && (
        <OpportunityModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </section>
  );
}