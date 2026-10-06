import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Star, ShieldCheck } from 'lucide-react';

export default function PeluangCard({ data, isFeatured = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getCategoryColor = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case 'beasiswa': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300';
      case 'karir': 
      case 'magang': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
      case 'lomba': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300';
    }
  };

  return (
    <div className={`group relative flex flex-col h-full rounded-2xl border transition-all duration-300 hover:shadow-xl ${
      isFeatured 
        ? 'bg-gradient-to-br from-white to-yellow-50/50 dark:from-gray-800 dark:to-yellow-900/10 border-yellow-400/50 ring-1 ring-yellow-400/20' 
        : 'bg-surface border-light-2 shadow-sm hover:border-primary/30'
    }`}>
      
      {isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase tracking-wide shadow-sm">
            <Star size={10} fill="currentColor" />
            Sponsored
          </span>
        </div>
      )}

      {/* PERBAIKAN DISINI: Ubah /peluang/${data.id} menjadi /bekal/${data.id} */}
      <Link to={`/bekal/${data.id}`} className="flex flex-col flex-grow no-underline">
        
        <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl bg-light-2">
          {data.image_url ? (
            <img 
              src={data.image_url} 
              alt={data.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary/10 to-accent/10">
              <ShieldCheck className="w-8 h-8 text-primary/40" />
            </div>
          )}
          
          <div className="absolute bottom-2 left-2">
             <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm ${getCategoryColor(data.category_name || 'Lainnya')}`}>
               {data.category_name || 'Umum'}
             </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className={`text-dark-1 font-bold leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors ${
            isFeatured ? 'text-lg' : 'text-base'
          }`}>
            {data.title}
          </h3>
          
          <p className="text-dark-2 text-xs line-clamp-2 mb-4 flex-grow">
            {data.description}
          </p>

          <div className="mt-auto space-y-2 pt-4 border-t border-light-2/50">
            <div className="flex items-center gap-2 text-xs text-dark-2/70">
              <MapPin size={12} />
              <span className="truncate">{data.location || 'Online / Seluruh Indonesia'}</span>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-dark-2">
                <Clock size={12} className="text-red-500" />
                <span>Deadline: {formatDate(data.deadline)}</span>
              </div>
              
              <button className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isFeatured 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md' 
                  : 'bg-primary/10 hover:bg-primary text-primary hover:text-on-dark'
              }`}>
                Lihat Detail
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}