import { useEffect, useState } from 'react';
import { Search, Plus, ArrowRight, ChevronLeft, ChevronRight, X, ChevronDown, UploadCloud } from 'lucide-react';
import PeluangCard from '../components/ui/PeluangCard'; // Pastikan path import sesuai
import { apiFetch } from '../lib/api';

export default function Bekal() {
  const [opportunities, setOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 6; 

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    category: 'Beasiswa Pendidikan',
    title: '',
    organizer: '',
    description: '',
    price: '',
    deadline: ''
  });

  const filters = ['Semua', 'Beasiswa', 'Karir & Magang', 'Lomba'];

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiFetch(`/api/opportunities?page=${currentPage}&limit=${itemsPerPage}&category=${encodeURIComponent(activeFilter)}&search=${encodeURIComponent(searchQuery)}`)
      .then((result) => {
        if (!cancelled) {
          setOpportunities(result.data || []);
          setTotalPages(result.totalPages || 1);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) setError(fetchError.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeFilter, currentPage, searchQuery]);
  
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

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/api/opportunities', { method: 'POST', body: JSON.stringify(formData) });
      setIsModalOpen(false);
      setFormData({ category: 'Beasiswa Pendidikan', title: '', organizer: '', description: '', price: '', deadline: '' });
      setCurrentPage(1);
      setError('');
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <section className="min-h-screen w-full px-4 py-24 font-sans bg-light-1 relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* === HEADER SECTION === */}
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

          {/* Search Bar */}
          <div className="w-full max-w-xl relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 to-primary/5 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-lg border-2 border-light-2/40 p-1.5 pl-5 transition-all group-focus-within:border-primary/30 group-focus-within:shadow-xl">
              <Search className="w-5 h-5 text-dark-2/40 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Cari beasiswa, lomba, atau magang..." 
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-transparent border-none py-2.5 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none"
              />
              <button className="bg-primary hover:bg-dark-1 text-light-1 p-2.5 rounded-full transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                  activeFilter === filter
                    ? 'bg-primary text-light-1 border-primary shadow-md'
                    : 'bg-white text-dark-2 border-light-2/30 hover:bg-light-2/20 hover:text-dark-1'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          {/* Tombol Aksi Utama - Membuka Modal */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-dark-1 text-light-1 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary transition-colors shadow-md mt-2"
          >
            <Plus className="w-4 h-4" />
            Ajukan Informasi Baru
          </button>
        </div>

        {/* === MAIN CONTENT: GRID PELUANG === */}
        {error && <p className="text-center text-sm text-red-600" role="alert">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-100">
          {isLoading ? (
            <p className="col-span-full text-center text-sm text-dark-2">Memuat peluang...</p>
          ) : currentOpportunities.length > 0 ? (
            currentOpportunities.map((item) => (
              <PeluangCard key={item.id} data={item} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-light-2">
              <div className="w-12 h-12 bg-light-1 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-dark-2/20" />
              </div>
              <h3 className="text-dark-1 font-bold text-sm">Peluang tidak ditemukan</h3>
              <p className="text-dark-2 text-xs mt-1">Coba kata kunci atau kategori lain.</p>
            </div>
          )}
        </div>

        {/* === PAGINATION CONTROLS === */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pb-8">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === 1
                  ? 'border-light-2/20 text-dark-2/30 cursor-not-allowed bg-transparent'
                  : 'border-light-2/30 text-dark-2 hover:bg-white hover:border-primary/30 hover:text-primary bg-white shadow-sm'
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
                      ? 'bg-primary text-light-1 shadow-md scale-105'
                      : 'bg-white text-dark-2 border border-light-2/30 hover:bg-light-2/20 hover:text-dark-1'
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
                  : 'border-light-2/30 text-dark-2 hover:bg-white hover:border-primary/30 hover:text-primary bg-white shadow-sm'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* === MODAL POPUP (Ajukan Informasi) === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-dark-1/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            
            {/* Scrollable Body jika konten panjang */}
            <div className="p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
              
              {/* Header Text */}
              <div className="mb-6">
                <h3 className="text-dark-1 font-bold text-lg leading-tight">Buat Informasi / Penawaran Jasa</h3>
                <p className="text-dark-2 text-xs mt-1 leading-relaxed">
                  Bagikan beasiswa, lowongan karir, info lomba, atau tawarkan keahlian kamu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Kategori Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-dark-1 font-bold text-xs block">Kategori</label>
                  <div className="relative">
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-dark-1 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none shadow-inner cursor-pointer"
                    >
                      <option>Beasiswa Pendidikan</option>
                      <option>Lomba Kompetensi</option>
                      <option>Karir & Magang</option>
                      <option>Penawaran Jasa / Keahlian</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-2/50 pointer-events-none" />
                  </div>
                </div>

                {/* Judul Info */}
                <div className="space-y-1.5">
                  <label className="text-dark-1 font-bold text-xs block">Judul Info</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Judul Program......." 
                    className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none shadow-inner"
                    required
                  />
                </div>

                {/* Penyelenggara */}
                <div className="space-y-1.5">
                  <label className="text-dark-1 font-bold text-xs block">Penyelenggara</label>
                  <input 
                    type="text" 
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    placeholder="Instansi/Nama Kamu...." 
                    className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none shadow-inner"
                    required
                  />
                </div>

                {/* Deskripsi Ringkas */}
                <div className="space-y-1.5">
                  <label className="text-dark-1 font-bold text-xs block">Deskripsi Ringkas</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Penjelasan..." 
                    rows={3}
                    className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none shadow-inner resize-none"
                    required
                  ></textarea>
                </div>

                {/* Biaya */}
                <div className="space-y-1.5">
                  <label className="text-dark-1 font-bold text-xs block">Biaya / Tarif Harga Jasa</label>
                  <input 
                    type="text" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Gratis/Rp50rb...." 
                    className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none shadow-inner"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <label className="text-dark-1 font-bold text-xs block">Batas Waktu (Deadline Hari Sisa)</label>
                  <input 
                    type="text" 
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    placeholder="11 September 2080..." 
                    className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none shadow-inner"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-primary hover:bg-dark-1 text-light-1 py-2.5 rounded-full font-bold text-sm transition-colors shadow-md"
                  >
                    Posting
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-primary hover:bg-dark-1 text-light-1 py-2.5 rounded-full font-bold text-sm transition-colors shadow-md"
                  >
                    Batal
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}