import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Eye,
  MoreHorizontal,
  Send,
  Share2,
  Bookmark
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function ForumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadPost = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiFetch(`/api/forum/${id}`);
      const post = result.data;
      const toInitials = (name) => (name || 'P').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
      setData({
        ...post,
        author_name: post.user_name || 'Pengguna',
        author_initials: toInitials(post.user_name),
        comments: (post.comments || []).map((comment) => ({
          ...comment,
          author_name: comment.user_name || 'Pengguna',
          author_initials: toInitials(comment.user_name),
        })),
      });
      setError('');
    } catch (fetchError) {
      setError(fetchError.message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 24) return `${diffHours} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleLike = async () => {
    try {
      const result = await apiFetch(`/api/forum/${id}/like`, { method: 'POST' });
      setData((current) => ({ ...current, like_count: result.data.like_count }));
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await apiFetch(`/api/forum/${id}/comment`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment('');
      await loadPost();
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  if (isLoading) return <div className="pt-24 text-center text-dark-2">Memuat diskusi...</div>;
  if (!data) return <div className="pt-24 text-center text-dark-2">{error || 'Diskusi tidak ditemukan.'}</div>;

  return (
    <div className="pt-20 min-h-screen bg-light-1 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {error && <p role="alert" className="mb-4 text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="bg-surface rounded-2xl border border-light-2 shadow-sm overflow-hidden relative mb-6">

          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 rounded-full bg-light-1 hover:bg-primary/10 text-dark-2 hover:text-accent transition-all duration-200 group z-10 border border-light-2/50"
            title="Kembali ke Forum"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="p-6 md:p-8 pt-16">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-accent flex items-center justify-center font-bold text-sm border border-primary/20">
                  {data.author_initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark-1">{data.author_name}</h4>
                  <span className="text-xs text-dark-2/70">{formatDate(data.created_at)}</span>
                </div>
              </div>
              <button className="p-1.5 hover:bg-light-1 rounded-full text-dark-2/50 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-dark-1 mb-4 leading-snug">
              {data.title}
            </h1>

            <div className="prose prose-sm max-w-none text-dark-2 leading-relaxed mb-6">
              <p className="whitespace-pre-line">{data.content}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-light-2/50">
              <div className="flex items-center gap-4 text-xs text-dark-2/70 font-medium">
                <span className="flex items-center gap-1.5">
                  <Eye size={14} />
                  {data.view_count} Dilihat
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart size={14} />
                  {data.like_count} Suka
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  {data.comment_count} Komentar
                </span>
              </div>

              <div className="flex items-center gap-2">
                 <button className="p-2 hover:bg-light-1 rounded-lg text-dark-2/60 hover:text-accent transition-colors" title="Simpan">
                    <Bookmark size={18} />
                 </button>
                 <button className="p-2 hover:bg-light-1 rounded-lg text-dark-2/60 hover:text-accent transition-colors" title="Bagikan">
                    <Share2 size={18} />
                 </button>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
               <button
                  onClick={handleLike}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-light-2 text-dark-2 text-sm font-semibold hover:bg-light-1 hover:border-primary/30 transition-all"
               >
                  <Heart size={16} />
                  Suka
               </button>
               <button
                  onClick={() => document.getElementById('comment-input').focus()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-dark-1 text-light-1 text-sm font-semibold hover:bg-primary hover:text-on-dark transition-colors"
               >
                  <MessageSquare size={16} />
                  Komentar
               </button>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-light-2 shadow-sm p-6 md:p-8">
          <h3 className="text-sm font-bold text-dark-1 uppercase tracking-wide mb-6 flex items-center gap-2">
            <MessageSquare size={16} className="text-accent" />
            Diskusi ({data.comments.length})
          </h3>

          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-light-2 flex items-center justify-center text-dark-2 text-xs font-bold shrink-0 mt-1">
                ME
              </div>
              <div className="flex-1 relative">
                <textarea
                  id="comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis tanggapan atau pertanyaan..."
                  className="w-full bg-light-1 border border-light-2 rounded-xl p-3 text-sm text-dark-1 placeholder:text-dark-2/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none min-h-20 transition-all"
                  rows="2"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      newComment.trim()
                        ? 'bg-primary text-on-dark hover:bg-primary/90 shadow-md shadow-primary/20'
                        : 'bg-light-2 text-dark-2/40 cursor-not-allowed'
                    }`}
                  >
                    Kirim
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="space-y-6">
            {data.comments.length > 0 ? (
              data.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-accent flex items-center justify-center text-xs font-bold shrink-0 border border-primary/10">
                    {comment.author_initials}
                  </div>
                  <div className="flex-1">
                    <div className="bg-light-1/50 p-3 rounded-xl rounded-tl-none border border-light-2/50 mb-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-dark-1">{comment.author_name}</span>
                        <span className="text-[10px] text-dark-2/50">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-dark-2 leading-relaxed">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 pl-2">
                       <button className="text-[10px] text-dark-2/60 font-semibold hover:text-accent flex items-center gap-1 transition-colors">
                          <Heart size={10} /> {comment.like_count}
                       </button>
                       <button className="text-[10px] text-dark-2/60 font-semibold hover:text-accent transition-colors">
                          Balas
                       </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-dark-2/50 text-sm">
                Belum ada komentar. Jadilah yang pertama berdiskusi!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}