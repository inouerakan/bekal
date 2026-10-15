import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageSquare, Send, Loader2, AlertCircle, CheckCircle, Trash2, CornerDownRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [commentError, setCommentError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [replyError, setReplyError] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            try { setCurrentUser(storedUser); } catch (e) { console.error("Failed to parse user", e); }
        }
        loadPost();
    }, [id]);

    const loadPost = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await apiFetch(`/api/forum/${id}`);
            const commentsWithReplies = flattenComments(result.data.comments || []);
            setData({ ...result.data, comments: commentsWithReplies });
        } catch (err) {
            setError(err.message || 'Gagal memuat diskusi.');
        } finally {
            setIsLoading(false);
        }
    };

    const flattenComments = (comments) => {
        let flattened = [];
        comments.forEach(comment => {
            flattened.push({ ...comment, depth: 0 });
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.forEach(reply => {
                    flattened.push({ ...reply, depth: 1, parent_author: comment.user_name });
                });
            }
        });
        return flattened;
    };

    const handleLike = async () => {
        if (!currentUser) { setError('Silakan login untuk menyukai post.'); return; }
        if (isLiking) return;
        setIsLiking(true);
        try {
            const result = await apiFetch(`/api/forum/${id}/like`, { method: 'POST' });
            setData(prev => prev ? { ...prev, like_count: result.data.like_count, user_has_liked: result.data.liked } : prev);
        } catch (actionError) {
            setError(actionError.message);
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentLike = async (commentId) => {
        if (!currentUser) { setCommentError('Silakan login untuk menyukai komentar.'); return; }
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
        } catch (err) { console.error(err); }
    };

    const handleMainCommentSubmit = async (e) => {
        e.preventDefault();
        setCommentError('');
        if (!newComment.trim()) return;
        if (!currentUser) { setCommentError('Silakan login untuk berkomentar.'); return; }
        if (containsBadWord(newComment)) { setCommentError('Komentar mengandung kata yang tidak pantas. Harap gunakan bahasa yang sopan.'); return; }
        setIsSubmitting(true);
        try {
            await apiFetch(`/api/forum/${id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment.trim(), parent_comment_id: null }),
            });
            setNewComment('');
            await loadPost();
        } catch (actionError) {
            setCommentError(actionError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplySubmit = async (e, parentId) => {
        e.preventDefault();
        setReplyError('');
        if (!replyContent.trim()) return;
        if (!currentUser) { setReplyError('Silakan login untuk membalas.'); return; }
        if (containsBadWord(replyContent)) { setReplyError('Balasan mengandung kata yang tidak pantas.'); return; }
        setIsReplying(true);
        try {
            await apiFetch(`/api/forum/${id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: replyContent.trim(), parent_comment_id: parentId }),
            });
            setReplyContent('');
            setReplyingToId(null);
            await loadPost();
        } catch (err) { setReplyError(err.message); }
        finally { setIsReplying(false); }
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
        } catch (err) { alert('Gagal menghapus komentar: ' + err.message); }
        finally { setDeletingCommentId(null); }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60));
        if (diffHours < 24) return `${diffHours} jam lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-28 min-h-screen bg-light-1 pb-12"
        >
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <motion.article
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-surface rounded-2xl border border-light-2/50 shadow-sm p-6 md:p-8 mb-8"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-accent flex items-center justify-center font-bold border border-primary/10">
                                {(data.user_name || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-dark-1">{data.user_name}</h4>
                                <span className="text-xs text-dark-2/70">{formatDate(data.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-dark-1 mb-4 leading-tight">
                        {data.title}
                    </h1>
                    {data.image_url && (
                        <img src={data.image_url} alt={data.title} className="w-full max-h-96 object-cover rounded-xl mb-4 border border-light-2/50" />
                    )}
                    <div className="prose prose-sm dark:prose-invert text-dark-2 leading-relaxed whitespace-pre-wrap mb-6">
                        {data.content}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-light-2/30">
                        <div className="flex items-center gap-4 text-xs text-dark-2/70 font-medium">
                            <span className="flex items-center gap-1"><Eye size={14}/>{data.view_count} Dilihat</span>
                            <span className="flex items-center gap-1"><Heart size={14}/>{data.like_count} Suka</span>
                            <span className="flex items-center gap-1"><MessageSquare size={14}/>{data.comment_count} Komentar</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={handleLike}
                                disabled={isLiking}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                    data.user_has_liked
                                        ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
                                        : 'text-dark-2/60 hover:bg-light-1 hover:text-red-400'
                                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={data.user_has_liked ? "Batal Suka" : "Suka"}
                            >
                                {isLiking ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <motion.div animate={data.user_has_liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                                        <Heart size={18} className={data.user_has_liked ? 'fill-current' : ''} />
                                    </motion.div>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.article>
                <section className="space-y-6">
                    <h3 className="text-lg font-bold text-dark-1 uppercase tracking-wide mb-6 flex items-center gap-2">
                        <MessageSquare size={18} className="text-accent" />
                        Diskusi ({data.comments.length})
                    </h3>
                    <form onSubmit={handleMainCommentSubmit} className="mb-8 bg-surface p-4 rounded-xl border border-light-2/50 shadow-sm">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-light-2 flex items-center justify-center text-dark-2 text-xs font-bold shrink-0 mt-1">
                                {currentUser ? currentUser.full_name?.charAt(0).toUpperCase() : 'ME'}
                            </div>
                            <div className="flex-1 relative">
                                <textarea
                                    id="main-comment-input"
                                    value={newComment}
                                    onChange={(e) => { setNewComment(e.target.value); setCommentError(''); }}
                                    placeholder={currentUser ? "Tulis tanggapan atau pertanyaan..." : "Login untuk berkomentar..."}
                                    disabled={!currentUser}
                                    className={`w-full bg-light-1 border rounded-xl p-3 text-sm text-dark-1 placeholder:text-dark-2/50 focus:outline-none focus:ring-1 resize-none min-h-20 transition-all ${
                                        commentError
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                                            : 'border-light-2 focus:border-primary focus:ring-primary'
                                    }`}
                                    rows="3"
                                />
                                {commentError && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-600 dark:text-red-400 mt-1.5 ml-1">
                                        {commentError}
                                    </motion.p>
                                )}
                                <div className="flex justify-end mt-2">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={!newComment.trim() || !currentUser || isSubmitting}
                                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            newComment.trim() && currentUser
                                                ? 'bg-primary text-on-dark hover:bg-primary/90 shadow-md shadow-primary/20'
                                                : 'bg-light-2 text-dark-2/40 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                        Kirim
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {data.comments.length > 0 ? (
                                data.comments.map((comment) => {
                                    const canDelete = currentUser && (
                                        Number(currentUser.id) === Number(comment.author_id) ||
                                        currentUser.role === 'admin'
                                    );
                                    const isReply = comment.depth > 0;
                                    return (
                                        <motion.div
                                            key={comment.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex gap-3 group ${isReply ? 'ml-8 md:ml-12 pl-4 border-l-2 border-light-2/50' : ''}`}
                                        >
                                            {!isReply && (
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-accent flex items-center justify-center text-xs font-bold shrink-0 border border-primary/10">
                                                    {(comment.user_name || '?').substring(0,2).toUpperCase()}
                                                </div>
                                            )}
                                            {isReply && (
                                                <CornerDownRight size={14} className="text-dark-2/30 mt-2 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className={`p-3 rounded-xl ${isReply ? 'bg-light-1/30 border border-light-2/30' : 'bg-light-1/50 border border-light-2/50'}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-dark-1">{comment.user_name}</span>
                                                            {isReply && comment.parent_author && (
                                                                <span className="text-[10px] text-dark-2/50 italic">membalas @{comment.parent_author}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-dark-2/50">{formatDate(comment.created_at)}</span>
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    disabled={deletingCommentId === comment.id}
                                                                    className="text-[10px] text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                                    title="Hapus"
                                                                >
                                                                    {deletingCommentId === comment.id ? 'Menghapus...' : 'Hapus'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-dark-2 leading-relaxed whitespace-pre-wrap break-words">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 pl-2 mt-1">
                                                    <motion.button
                                                        whileTap={{ scale: 0.85 }}
                                                        onClick={() => handleCommentLike(comment.id)}
                                                        className={`text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                                                            comment.user_has_liked ? 'text-red-500' : 'text-dark-2/60 hover:text-red-400'
                                                        }`}
                                                    >
                                                        <Heart size={10} className={comment.user_has_liked ? 'fill-current' : ''} />
                                                        {comment.like_count}
                                                    </motion.button>
                                                    {!isReply && (
                                                        <button
                                                            onClick={() => {
                                                                setReplyingToId(replyingToId === comment.id ? null : comment.id);
                                                                setReplyError('');
                                                                setReplyContent('');
                                                            }}
                                                            className="text-[10px] text-dark-2/60 font-semibold hover:text-accent transition-colors flex items-center gap-1"
                                                        >
                                                            Balas
                                                        </button>
                                                    )}
                                                </div>
                                                <AnimatePresence>
                                                    {replyingToId === comment.id && !isReply && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="mt-3 ml-2 overflow-hidden"
                                                        >
                                                            <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={replyContent}
                                                                    onChange={(e) => { setReplyContent(e.target.value); setReplyError(''); }}
                                                                    placeholder={`Balas @${comment.user_name}...`}
                                                                    className="flex-1 bg-light-1 border border-light-2 rounded-lg px-3 py-2 text-xs text-dark-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={isReplying || !replyContent.trim()}
                                                                    className="bg-primary text-on-dark px-3 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
                                                                >
                                                                    {isReplying ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
                                                                    Kirim
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setReplyingToId(null)}
                                                                    className="text-dark-2/50 hover:text-dark-1 px-2 py-2 text-xs"
                                                                >
                                                                    Batal
                                                                </button>
                                                            </form>
                                                            {replyError && (
                                                                <p className="text-[10px] text-red-500 mt-1 ml-1">{replyError}</p>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-dark-2/50 text-sm bg-surface rounded-xl border border-dashed border-light-2">
                                    Belum ada komentar. Jadilah yang pertama berdiskusi!
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </div>
        </motion.div>
    );
}