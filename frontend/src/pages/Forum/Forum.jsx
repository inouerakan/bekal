import { useState } from 'react';
import { MessageSquare, Heart, Search, Plus, ArrowRight, ChevronLeft, ChevronRight, X, Send } from 'lucide-react';

// Data Dummy awal
const initialDiscussions = [
  { id: 1, title: 'Cara Lolos Esai Beasiswa LPDP untuk Pelajar SMA', author: 'Khaffa Daru', avatar: 'KD', content: 'Halo semuanya, aku mau sharing pengalaman kemarin saat apply beasiswa. Ternyata kunci utamanya ada di struktur esai...', likes: 24, comments: 12, time: '2 jam lalu' },
  { id: 2, title: 'Tim untuk Lomba Hackathon Nasional 2026', author: 'Diaz Arqila', avatar: 'DA', content: 'Lagi cari 1 orang lagi buat tim hackathon bulan depan. Skill yang dibutuhkan: React.js dan Node.js. Minat DM ya!', likes: 8, comments: 5, time: '5 jam lalu' },
  { id: 3, title: 'Review Magang di Startup Teknologi Jakarta', author: 'Derien Adelio', avatar: 'DR', content: 'Baru selesai magang 3 bulan di sini. Culture-nya enak banget, mentor suportif. Worth it buat yang mau belajar.', likes: 45, comments: 20, time: '1 hari lalu' },
  { id: 4, title: 'Bedanya Beasiswa Prestasi dan Beasiswa Kurang Mampu?', author: 'Rakan Shaka', avatar: 'RS', content: 'Guys, ada yang tau gak sih bedanya syarat administrasi antara dua jenis beasiswa ini? Bingung mau apply yang mana.', likes: 3, comments: 8, time: '1 hari lalu' },
  { id: 5, title: 'Template CV ATS Friendly untuk Pelajar', author: 'Muhammad Rafi', avatar: 'MR', content: 'Banyak yang nanya soal CV. Ini aku share template simpel yang pernah aku pakai buat daftar magang dan lolos.', likes: 102, comments: 34, time: '2 hari lalu' },
  { id: 6, title: 'Persiapan Olimpiade Sains Nasional (OSN)', author: 'Reindy Alfriza', avatar: 'RA', content: 'Ada yang sama-sama persiapan OSN Komputer gak? Mari saling share sumber belajar dan latihan soal di sini.', likes: 15, comments: 7, time: '3 hari lalu' },
  { id: 7, title: 'Tips Wawancara Magang bagi Pemula', author: 'Khaffa Daru', avatar: 'KD', content: 'Nervous mau interview pertama? Tenang, ini tips dari pengalamanku di 3 perusahaan berbeda...', likes: 30, comments: 10, time: '4 hari lalu' },
  { id: 8, title: 'Rekomendasi Laptop untuk Anak Teknik', author: 'Diaz Arqila', avatar: 'DA', content: 'Budget 10 juta dapet apa ya yang kuat buat coding dan render ringan? Mohon sarannya suhu.', likes: 12, comments: 25, time: '5 hari lalu' },
];

export default function Forum() {
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State untuk Form Input
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Logika Search
  const filteredData = discussions.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Logika Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDiscussions = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Fungsi Handle Submit Form
  const handleSubmitDiscussion = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newDiscussion = {
      id: discussions.length + 1,
      title: newTitle,
      author: 'Anda (User)', // Hardcoded untuk dummy
      avatar: 'ME',
      content: newContent,
      likes: 0,
      comments: 0,
      time: 'Baru saja'
    };

    // Tambahkan ke awal array agar muncul paling atas
    setDiscussions([newDiscussion, ...discussions]);
    
    // Reset form dan tutup modal
    setNewTitle('');
    setNewContent('');
    setIsModalOpen(false);
    setCurrentPage(1); // Kembali ke halaman 1 untuk melihat post baru
  };

  return (
    <section className="min-h-screen w-full px-4 py-24 font-sans bg-light-1 relative">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        
        {/* === HEADER SECTION === */}
        <div className="flex flex-col items-center text-center space-y-6 pt-8">
          <div className="space-y-3">
            <h1 className="text-dark-1 text-3xl md:text-4xl font-bold tracking-tight">
              Forum Komunitas Pelajar
            </h1>
            <p className="text-dark-2 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Tempat berbagi tips, mencari tim lomba, dan diskusi seputar beasiswa serta karir. 
              Temukan jawaban atau bagikan pengalamanmu di sini.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-xl relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-lg border-2 border-light-2/40 p-1.5 pl-5 transition-all group-focus-within:border-primary/30 group-focus-within:shadow-xl">
              <Search className="w-5 h-5 text-dark-2/40 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Cari diskusi, tips, atau pengguna..." 
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-transparent border-none py-2.5 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none"
              />
              <button className="bg-primary hover:bg-dark-1 text-light-1 p-2.5 rounded-full transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tombol Aksi - Membuka Modal */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-dark-1 text-light-1 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary transition-colors shadow-md mt-2"
          >
            <Plus className="w-4 h-4" />
            Mulai Diskusi Baru
          </button>
        </div>

        {/* === MAIN CONTENT: LIST DISCUSSIONS === */}
        <div className="flex flex-col gap-4 min-h-[400px]">
          {currentDiscussions.length > 0 ? (
            currentDiscussions.map((item) => (
              <DiscussionCard key={item.id} data={item} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-light-2">
              <div className="w-12 h-12 bg-light-1 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-dark-2/20" />
              </div>
              <h3 className="text-dark-1 font-bold text-sm">Tidak ada diskusi ditemukan</h3>
              <p className="text-dark-2 text-xs mt-1">Coba kata kunci lain.</p>
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

      {/* === MODAL POPUP (Create Discussion) === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-dark-1/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-primary p-4 flex items-center gap-3">
              <div className="bg-green-500 p-1.5 rounded-full text-white">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="text-light-1 font-bold text-lg">Buat diskusi Baru</h3>
            </div>

            {/* Modal Body (Form) */}
            <form onSubmit={handleSubmitDiscussion} className="p-6 space-y-5">
              
              {/* Input Judul */}
              <div className="space-y-2">
                <label className="text-dark-1 font-bold text-sm block">Judul Info</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masukkan Judul Diskusi Anda...." 
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none shadow-inner"
                  required
                />
              </div>

              {/* Textarea Konten */}
              <div className="space-y-2">
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Tuliskan Pertanyaan atau informasi anda secara detail disini. Jelaskan konteks dengan baik agar mudah dimengerti" 
                  rows={4}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none shadow-inner resize-none"
                  required
                ></textarea>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button 
                  type="submit"
                  className="flex-1 bg-primary hover:bg-dark-1 text-light-1 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  Kirim Diskusi
                  <Send className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 bg-primary hover:bg-dark-1 text-light-1 py-3 rounded-full font-bold text-sm transition-colors shadow-md"
                >
                  Tutup
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </section>
  );
}

// Komponen Kartu Diskusi
function DiscussionCard({ data }) {
  return (
    <div className="bg-white rounded-xl border-2 border-light-2/50 p-5 flex flex-col sm:flex-row gap-4 hover:border-primary/20 hover:shadow-sm transition-all duration-300 group cursor-pointer">
      
      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center text-xs font-bold border border-primary/10">
          {data.avatar}
        </div>
        <div className="sm:hidden flex flex-col items-end">
           <span className="text-[10px] text-dark-2/50">{data.time}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-dark-1">{data.author}</span>
          <span className="w-1 h-1 rounded-full bg-light-2"></span>
          <span className="text-[10px] text-dark-2/50 hidden sm:inline">{data.time}</span>
        </div>
        
        <h3 className="text-dark-1 text-base font-bold mb-1.5 leading-snug group-hover:text-primary transition-colors truncate">
          {data.title}
        </h3>
        
        <p className="text-dark-2/70 text-xs leading-relaxed line-clamp-2">
          {data.content}
        </p>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-light-2/20 sm:border-none shrink-0">
        <div className="flex items-center gap-4 sm:gap-3 text-dark-2/50">
          <div className="flex items-center gap-1.5 text-[11px] hover:text-primary transition-colors">
            <Heart className="w-3.5 h-3.5" />
            <span>{data.likes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] hover:text-primary transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{data.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}