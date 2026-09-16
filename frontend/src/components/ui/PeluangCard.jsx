import { ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function PeluangCard({ data }) {
  const navigate = useNavigate();

  // Function to handle click
  const handleClick = () => {
    navigate(`/bekal/${data.id}`); // Navigate to /bekal/1, /bekal/2, etc.
  };

  return (
    // Added onClick and cursor-pointer
    <div 
      onClick={handleClick}
      className="bg-light-1 rounded-2xl border-2 border-light-2/50 p-6 flex flex-col justify-between hover:border-primary/30 hover:shadow-lg transition-all duration-300 group h-full cursor-pointer"
    >
      
      {/* Card Content */}
      <div>
        {/* Category Label */}
        <span className="inline-block px-2.5 py-1 bg-light-2/10 text-dark-2 text-[10px] uppercase tracking-wider font-semibold rounded-md mb-4 border border-light-2/20">
          {data.category}
        </span>

        {/* Title */}
        <h3 className="text-dark-1 text-lg font-bold mb-2 leading-snug group-hover:text-primary transition-colors">
          {data.title}
        </h3>
        
        {/* Organizer */}
        <p className="text-dark-2 text-xs font-medium mb-4 flex items-center gap-1.5">
           <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
           {data.organizer}
        </p>

        {/* Description */}
        <p className="text-dark-2/70 text-xs leading-relaxed mb-6 line-clamp-3">
          {data.description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="pt-4 border-t border-light-2/20 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1.5 text-dark-2 text-[10px] font-medium">
            <Calendar className="w-3 h-3" />
            {data.date}
          </div>
          
          {/* Badge Harga */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            data.isPaid 
              ? 'bg-light-2/10 text-dark-1' 
              : 'bg-light-2/10 text-primary'
          }`}>
            {data.price}
          </span>
        </div>

        {/* Button */}
        <button className="w-full h-10 rounded-xl bg-dark-1 text-light-1 text-xs font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2 group-hover:bg-primary">
          Lihat & Daftar
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}