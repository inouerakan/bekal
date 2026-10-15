import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch, getStoredUser } from '../../lib/api';

export default function ForumCard({ data }) {
    const navigate = useNavigate();
    const [isLiking, setIsLiking] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(data.like_count || 0);
    const [hasLiked, setHasLiked] = useState(data.user_has_liked || false);

    useEffect(() => {
        setLocalLikeCount(data.like_count || 0);
        setHasLiked(data.user_has_liked || false);
    }, [data.id, data.like_count, data.user_has_liked]);

    const handleClick = () => {
        navigate(`/forum/${data.id}`);
    };

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        if (!getStoredUser()) {
            alert('Silakan login terlebih dahulu untuk menyukai post.');
            return;
        }
        if (isLiking) return;
        setIsLiking(true);
        try {
            const result = await apiFetch(`/api/forum/${data.id}/like`, { method: 'POST' });
            setLocalLikeCount(result.data.like_count);
            setHasLiked(result.data.liked);
        } catch (error) {
            console.error("Gagal like:", error);
            alert('Gagal menyukai post: ' + error.message);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={handleClick}
            className="bg-surface rounded-xl border-2 border-light-2/50 p-5 flex flex-col sm:flex-row gap-4 hover:border-primary/20 hover:shadow-sm duration-300 group cursor-pointer relative"
        >
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/5 text-accent flex items-center justify-center text-xs font-bold border border-primary/10 group-hover:bg-primary/10 transition-colors">
                    {data.avatar || data.author?.substring(0, 2).toUpperCase()}
                </div>
                <div className="sm:hidden flex flex-col items-end">
                    <span className="text-[10px] text-dark-2/50">{data.time}</span>
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-dark-1 group-hover:text-accent transition-colors">
                        {data.author || 'Pengguna'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-light-2"></span>
                    <span className="text-[10px] text-dark-2/50 hidden sm:inline">{data.time}</span>
                </div>
                <h3 className="text-dark-1 text-base font-bold mb-1.5 leading-snug group-hover:text-accent transition-colors line-clamp-1">
                    {data.title}
                </h3>
                <p className="text-dark-2/70 text-xs leading-relaxed line-clamp-2">
                    {data.content}
                </p>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-light-2/20 sm:border-none shrink-0">
                <div className="flex items-center gap-4 sm:gap-3 text-dark-2/50">
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={handleLikeClick}
                        disabled={isLiking}
                        className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer px-1 py-0.5 rounded ${
                            hasLiked
                                ? 'text-red-500'
                                : 'hover:text-accent'
                        } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={hasLiked ? "Batal Suka" : "Suka"}
                    >
                        {isLiking ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <motion.div
                                animate={hasLiked ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.3 }}
                            >
                                <Heart size={14} className={hasLiked ? 'fill-current' : ''} />
                            </motion.div>
                        )}
                        <span>{localLikeCount}</span>
                    </motion.button>
                    <div className="flex items-center gap-1.5 text-[11px] hover:text-accent transition-colors cursor-default">
                        <MessageSquare size={14} />
                        <span>{data.comment_count || data.comments}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}