import { useCallback, useEffect, useState } from 'react';
import { Search, Plus, ArrowRight, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import ForumCard from '../components/ui/ForumCard';
import { apiFetch } from '../lib/api';
import ImageUploader from '../components/ui/ImageUploader';

export default function Forum() {
  const [newImage, setNewImage] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDiscussions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100', search: searchQuery });
      const result = await apiFetch(`/api/forum?${params}`);
      
      setDiscussions((result.data || []).map((post) => ({
        ...post, // <- Ini penting agar semua field asli (termasuk user_has_liked) terbawa
        
        // Mapping ulang untuk kebutuhan tampilan ForumCard
        author: post.user_name || 'Pengguna',
        avatar: (post.user_name || 'P').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        likes: post.like_count || 0,
        comments: post.comment_count || 0,
        time: post.created_at ? new Date(post.created_at).toLocaleDateString('id-ID') : '',
        
        // PASTIKAN FIELD INIK DIKIRIM KE FORUMCARD AGAR IKON HATI BISA MERAH SAAT REFRESH
        user_has_liked: Boolean(post.user_has_liked), 
      })));
      
      setError('');
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => { loadDiscussions(); }, [loadDiscussions]);

  const filteredData = discussions;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDiscussions = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const openModal = () => {
    setFormErrors({});
    setSubmitError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setFormErrors({});
    setSubmitError('');
    setNewImage(null); // ✅ RESET GAMBAR SAAT TUTUP
    setIsModalOpen(false);
  };

  const validateForm = () => {
    const errors = {};
    const title = newTitle.trim();
    const content = newContent.trim();

    if (!title) errors.title = 'Judul wajib diisi';
    else if (title.length < 5) errors.title = 'Judul minimal 5 karakter';
    else if (title.length > 200) errors.title = 'Judul maksimal 200 karakter';

    if (!content) errors.content = 'Isi diskusi wajib diisi';
    else if (content.length < 10) errors.content = 'Isi diskusi minimal 10 karakter';

    return errors;
  };

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await apiFetch('/api/forum/discussion', {
        method: 'POST',
        body: JSON.stringify({ 
          title: newTitle.trim(), 
          content: newContent.trim(),
          image_url: newImage // ✅ KIRIM URL GAMBAR KE BACKEND
        }),
      });
      setNewTitle('');
      setNewContent('');
      setNewImage(null); // ✅ RESET GAMBAR SETELAH SUBMIT
      setFormErrors({});
      setIsModalOpen(false);
      setCurrentPage(1);
      await loadDiscussions();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    'w-full bg-light-1 rounded-xl px-4 py-3 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none focus:ring-2 transition-all border-none shadow-inner';

  return (
    <section className="min-h-screen w-full px-4 py-24 font-sans bg-light-1 relative">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">

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

          <div className="w-full max-w-xl relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 to-primary/5 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-surface rounded-full shadow-lg border-2 border-light-2/40 p-1.5 pl-5 transition-all group-focus-within:border-primary/30 group-focus-within:shadow-xl">
              <Search className="w-5 h-5 text-dark-2/40 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Cari diskusi, tips, atau pengguna..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-transparent border-none py-2.5 text-sm text-dark-1 placeholder:text-dark-2/40 focus:outline-none"
              />
              <button className="bg-primary hover:bg-dark-1 text-on-dark hover:text-light-1 p-2.5 rounded-full transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 bg-dark-1 text-light-1 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary hover:text-on-dark transition-colors shadow-md mt-2"
          >
            <Plus className="w-4 h-4" />
            Mulai Diskusi Baru
          </button>
        </div>

        {error && <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex flex-col gap-4 min-h-100">
          {isLoading ? <p className="text-center text-sm text-dark-2">Memuat diskusi...</p> : null}
          {!isLoading && currentDiscussions.length > 0 ? (
            currentDiscussions.map((item) => (
              <ForumCard key={item.id} data={item} />
            ))
          ) : !isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface rounded-2xl border border-dashed border-light-2">
              <div className="w-12 h-12 bg-light-1 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-dark-2/20" />
              </div>
              <h3 className="text-dark-1 font-bold text-sm">Tidak ada diskusi ditemukan</h3>
              <p className="text-dark-2 text-xs mt-1">Coba kata kunci lain.</p>
            </div>
          ) : null}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

            <div className="bg-primary p-4 flex items-center gap-3 shrink-0">
              <div className="bg-on-dark/20 p-1.5 rounded-full text-on-dark">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="text-on-dark font-bold text-lg">Buat Diskusi Baru</h3>
            </div>

            <form onSubmit={handleSubmitDiscussion} noValidate className="p-6 space-y-5 overflow-y-auto flex-1">

              <div className="space-y-2">
                <label htmlFor="forum-title" className="text-dark-1 font-bold text-sm block">
                  Judul Diskusi
                </label>
                <input
                  id="forum-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masukkan Judul Diskusi Anda...."
                  maxLength={200}
                  aria-invalid={!!formErrors.title}
                  className={`${inputBase} ${
                    formErrors.title ? 'ring-2 ring-red-400' : 'focus:ring-primary/20'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-600 dark:text-red-400">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="forum-content" className="text-dark-1 font-bold text-sm block">
                  Isi Diskusi
                </label>
                <textarea
                  id="forum-content"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Tuliskan pertanyaan atau informasi anda secara detail..."
                  rows={4}
                  aria-invalid={!!formErrors.content}
                  className={`${inputBase} resize-none ${
                    formErrors.content ? 'ring-2 ring-red-400' : 'focus:ring-primary/20'
                  }`}
                ></textarea>
                {formErrors.content && (
                  <p className="text-xs text-red-600 dark:text-red-400">{formErrors.content}</p>
                )}
              </div>

              {/* ✅ TAMBAHKAN IMAGE UPLOADER DI SINI */}
              <ImageUploader 
                value={newImage} 
                onChange={setNewImage} 
                label="Gambar Diskusi (Opsional)" 
              />

              {submitError && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
                  {submitError}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-dark-1 disabled:opacity-60 disabled:cursor-not-allowed text-on-dark hover:text-light-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Diskusi'}
                  {!isSubmitting && <Send className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-6 bg-light-2 hover:bg-light-2/80 text-dark-1 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                >
                  Batal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </section>
  );
}