// src/components/ui/DiscussionCard.jsx
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Heart } from 'lucide-react';

export default function ForumCard({ data }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigasi ke halaman detail forum berdasarkan ID
    navigate(`/forum/${data.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl border-2 border-light-2/50 p-5 flex flex-col sm:flex-row gap-4 hover:border-primary/20 hover:shadow-sm transition-all duration-300 group cursor-pointer"
    >
      
      {/* Avatar Section */}
      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center text-xs font-bold border border-primary/10 group-hover:bg-primary/10 transition-colors">
          {data.avatar}
        </div>
        {/* Time display for mobile view inside avatar column */}
        <div className="sm:hidden flex flex-col items-end">
           <span className="text-[10px] text-dark-2/50">{data.time}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-dark-1 group-hover:text-primary transition-colors">{data.author}</span>
          <span className="w-1 h-1 rounded-full bg-light-2"></span>
          <span className="text-[10px] text-dark-2/50 hidden sm:inline">{data.time}</span>
        </div>
        
        <h3 className="text-dark-1 text-base font-bold mb-1.5 leading-snug group-hover:text-primary transition-colors line-clamp-1">
          {data.title}
        </h3>
        
        <p className="text-dark-2/70 text-xs leading-relaxed line-clamp-2">
          {data.content}
        </p>
      </div>

      {/* Stats Section */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-light-2/20 sm:border-none shrink-0">
        <div className="flex items-center gap-4 sm:gap-3 text-dark-2/50">
          <div className="flex items-center gap-1.5 text-[11px] hover:text-primary transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <Heart className="w-3.5 h-3.5" />
            <span>{data.likes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] hover:text-primary transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{data.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}