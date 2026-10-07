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
    Bookmark,
    Loader2
} from 'lucide-react';
import { apiFetch, getStoredUser } from '../lib/api';

const BAD_WORDS = [
    'anjing', 'babi', 'bangsat', 'kontol', 'memek', 'ngentot', 'tolol',
    'goblok', 'bodoh', 'idiot', 'kampret', 'taik', 'tai', 'jancok',
    'cok', 'asu', 'jembut', 'perek', 'lonte', 'bacot', 'sialan'
];

const containsBadWord = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    return BAD_WORDS.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
};

export default function ForumDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [newComment, setNewComment] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLiking, setIsLiking] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const currentUser = getStoredUser();

    const loadPost = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await apiFetch(`/api/forum/${id}`);
            const post = result.data;
            const toInitials = (name) => (name || 'P').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
            
            setData({
                ...post,
                author_name: post.user_name || 'Pengguna',
                author_initials: toInitials(post.user_name),
                comments: (post.comments || []).map(comment => ({
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

    useEffect(() => {
        loadPost();
    }, [loadPost]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60));
        if (diffHours < 24) return `${diffHours} jam lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const handleLike = async () => {
        if (!currentUser) {
            setError('Silakan login untuk menyukai post.');
            return;
        }
        if (isLiking) return;
        setIsLiking(true);
        try {
            const result = await apiFetch(`/api/forum/${id}/like`, { method: 'POST' });
            setData(prev => prev ? {
                ...prev,
                like_count: result.data.like_count,
                user_has_liked: result.data.liked
            } : prev);
        } catch (actionError) {
            setError(actionError.message);
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentLike = async (commentId) => {
        if (!currentUser) {
            setCommentError('Silakan login untuk menyukai komentar.');
            return;
        }
        try {
            const result = await apiFetch(`/api/forum/${commentId}/like`, { method: 'POST' });
            setData(prev => prev ? {
                ...prev,
                comments: prev.comments.map(c =>
                    Number(c.id) === Number(commentId)
                        ? { ...c, like_count: result.data.like_count, user_has_liked: result.data.liked }
                        : c
                )
            } : prev);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setCommentError('');
        if (!newComment.trim()) return;
        if (!currentUser) {
            setCommentError('Silakan login untuk berkomentar.');
            return;
        }
        if (containsBadWord(newComment)) {
            setCommentError('Komentar mengandung kata yang tidak pantas. Harap gunakan bahasa yang sopan.');
            return;
        }
        try {
            await apiFetch(`/api/forum/${id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment }),
            });
            setNewComment('');
            await loadPost();
        } catch (actionError) {
            setCommentError(actionError.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Yakin ingin menghapus komentar ini?')) return;
        setDeletingCommentId(commentId);
        try {
            await apiFetch(`/api/forum/${commentId}`, { method: 'DELETE' });
            setData(prev => prev ? {
                ...prev,
                comments: prev.comments.filter(c => Number(c.id) !== Number(commentId)),
                comment_count: Math.max(0, prev.comment_count - 1)
            } : prev);
        } catch (err) {
            alert('Gagal menghapus komentar: ' + err.message);
        } finally {
            setDeletingCommentId(null);
        }
    };

    if (isLoading) return (
        <div className="pt-28 min-h-screen flex items-center justify-center bg-light-1">
            <Loader2 className="w-6 h-6 animate-spin text-accent mr-2" />
            <span className="text-dark-2">Memuat diskusi...</span>
        </div>
    );

    if (!data) return (
        <div className="pt-28 min-h-screen flex items-center justify-center bg-light-1">
            <div className="text-center">
                <p className="text-dark-2 mb-4">{error || 'Diskusi tidak ditemukan.'}</p>
                <button onClick={() => navigate('/forum')} className="text-accent text-sm font-bold underline">
                    Kembali ke Forum
                </button>
            </div>
        </div>
    );

    return (
        <div className="pt-28 min-h-screen bg-light-1 pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {error && (
                    <p role="alert" className="mb-4 text-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-2">
                        {error}
                    </p>
                )}

                <div className="bg-surface rounded-2xl border border-light-2 shadow-sm overflow-hidden relative mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 p-2 rounded-full bg-light-1 hover:bg-primary/10 text-dark-2 hover:text-accent transition-all duration-200 group z-10 border border-light-2/50"
                        title="Kembali"
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

                        {data.image_url && (
                            <div className="my-6 rounded-xl overflow-hidden border border-light-2/50">
                                <img src={data.image_url} alt="Forum attachment" className="w-full h-auto max-h-96 object-cover" />
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-light-2/50">
                            <div className="flex items-center gap-4 text-xs text-dark-2/70 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Eye size={14} />{data.view_count} Dilihat
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Heart size={14} />{data.like_count} Suka
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MessageSquare size={14} />{data.comment_count} Komentar
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        data.user_has_liked
                                            ? 'text-red-500 bg-red-50 dark:bg-red-500/10 scale-110'
                                            : 'text-dark-2/60 hover:bg-light-1 hover:text-red-400'
                                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={data.user_has_liked ? "Batal Suka" : "Suka"}
                                >
                                    {isLiking ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Heart size={18} className={data.user_has_liked ? 'fill-current' : ''} />
                                    )}
                                </button>
                                <button className="p-2 hover:bg-light-1 rounded-lg text-dark-2/60 transition-colors">
                                    <Share2 size={18} />
                                </button>
                                <button className="p-2 hover:bg-light-1 rounded-lg text-dark-2/60 transition-colors">
                                    <Bookmark size={18} />
                                </button>
                            </div>
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
                                {currentUser ? currentUser.full_name?.charAt(0).toUpperCase() : 'ME'}
                            </div>
                            <div className="flex-1 relative">
                                <textarea
                                    id="comment-input"
                                    value={newComment}
                                    onChange={(e) => { setNewComment(e.target.value); setCommentError(''); }}
                                    placeholder={currentUser ? "Tulis tanggapan atau pertanyaan..." : "Login untuk berkomentar..."}
                                    disabled={!currentUser}
                                    className={`w-full bg-light-1 border rounded-xl p-3 text-sm text-dark-1 placeholder:text-dark-2/50 focus:outline-none focus:ring-1 resize-none min-h-20 transition-all ${
                                        commentError
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                                            : 'border-light-2 focus:border-primary focus:ring-primary'
                                    }`}
                                    rows="2"
                                />
                                {commentError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 ml-1">{commentError}</p>
                                )}
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || !currentUser}
                                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            newComment.trim() && currentUser
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
                            data.comments.map((comment) => {
                                const canDelete = currentUser && (
                                    Number(currentUser.id) === Number(comment.author_id) ||
                                    currentUser.role === 'admin'
                                );

                                return (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-accent flex items-center justify-center text-xs font-bold shrink-0 border border-primary/10">
                                            {comment.author_initials}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-light-1/50 p-3 rounded-xl rounded-tl-none border border-light-2/50 mb-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-dark-1">{comment.author_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-dark-2/50">{formatDate(comment.created_at)}</span>
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                disabled={deletingCommentId === comment.id}
                                                                className="text-[10px] text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                                title="Hapus Komentar"
                                                            >
                                                                {deletingCommentId === comment.id ? 'Menghapus...' : 'Hapus'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-dark-2 leading-relaxed">{comment.content}</p>
                                            </div>

                                            <div className="flex items-center gap-3 pl-2">
                                                <button
                                                    onClick={() => handleCommentLike(comment.id)}
                                                    className={`text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                                                        comment.user_has_liked
                                                            ? 'text-red-500'
                                                            : 'text-dark-2/60 hover:text-red-400'
                                                    }`}
                                                >
                                                    <Heart size={10} className={comment.user_has_liked ? 'fill-current' : ''} />
                                                    {comment.like_count}
                                                </button>
                                                <button className="text-[10px] text-dark-2/60 font-semibold hover:text-accent transition-colors">
                                                    Balas
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
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