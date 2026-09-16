import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  User,
  Clock,
  FileText,
  Share2
} from 'lucide-react';

// Mock data simulating the database structure from the image
const mockDatabase = {
  "1": {
    id: 1,
    category_id: 3,
    category_name: "LOMBA",
    title: "Software Development Competition",
    organizer_name: "Himpunan Mahasiswa Komputer",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    requirements: "1. Siswa SMA/SMK Aktif\n2. Tim terdiri dari 2-3 orang\n3. Mengisi formulir pendaftaran online\n4. Melampirkan portofolio github (jika ada)",
    education_level: "SMA / SMK Sederajat",
    location: "Online / Jakarta",
    cost: "Rp 50.000 / Tim",
    registration_link: "https://example.com/register",
    deadline: "2080-06-28T23:59:00",
    status: "published",
    rejection_reason: null,
    submitted_by: 101,
    verified_by: 1,
    view_count: 1250,
    created_at: "2026-08-01T10:00:00",
    updated_at: "2026-08-02T14:30:00"
  },
};

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const data = mockDatabase[id] || mockDatabase["1"];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatCost = (cost) => {
    if (!cost || cost === "0" || cost.toLowerCase().includes("gratis")) return "Gratis";
    return cost;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold"><CheckCircle2 size={12}/> Terverifikasi</span>;
      case 'pending':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold"><Clock size={12}/> Menunggu Verifikasi</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold"><AlertCircle size={12}/> Ditolak</span>;
      default:
        return null;
    }
  };

  return (
    // Wrapper Utama: pt-20 untuk memberi ruang Navbar Global, min-h-screen agar footer tidak naik jika konten sedikit
    <div className="pt-20 min-h-screen bg-light-1 pb-12">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title Section - DENGAN TOMBOL KEMBALI MENEMPEL DI SINI */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-light-2 shadow-sm relative overflow-hidden">
              
              {/* Tombol Kembali (Floating di dalam card) */}
              <button 
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 p-2 rounded-full bg-light-1 hover:bg-primary/10 text-dark-2 hover:text-primary transition-all duration-200 group z-10 border border-light-2/50"
                title="Kembali"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* Views Counter (Floating di kanan atas card) */}
              <div className="absolute top-4 right-4 text-[10px] text-dark-2 flex items-center gap-1 bg-light-1 px-2.5 py-1 rounded-full border border-light-2/50">
                <Eye size={12} />
                <span className="font-medium">{data.view_count}</span>
              </div>

              {/* Spacer untuk memberi ruang bagi tombol absolute di atas */}
              <div className="mt-8 mb-4">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold rounded-md border border-primary/20">
                    {data.category_name}
                  </span>
                  {getStatusBadge(data.status)}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-dark-1 mb-3 leading-tight pr-8">
                  {data.title}
                </h1>
                
                <div className="flex items-center gap-2 text-dark-2 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {data.organizer_name}
                </div>
              </div>

              <div className="border-t border-light-2/50 my-6"></div>

              {/* Description */}
              <div className="prose prose-sm max-w-none text-dark-2 leading-relaxed">
                <h3 className="text-dark-1 font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                  Deskripsi
                </h3>
                <p className="whitespace-pre-line text-justify text-sm md:text-base">{data.description}</p>
              </div>
            </div>

            {/* Requirements Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-light-2 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <FileText size={18} />
                </div>
                <h3 className="text-dark-1 font-bold text-sm uppercase tracking-wide">Persyaratan</h3>
              </div>
              <div className="text-sm text-dark-2 whitespace-pre-line leading-relaxed bg-light-1/50 p-5 rounded-xl border border-light-2/50 font-medium">
                {data.requirements || "Tidak ada persyaratan khusus yang tercantum."}
              </div>
            </div>

            {/* Admin Info (Only visible if status is rejected) */}
            {data.status === 'rejected' && data.rejection_reason && (
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 animate-fade-in">
                <div className="flex items-center gap-2 mb-2 text-red-700">
                  <AlertCircle size={18} />
                  <h3 className="font-bold text-sm">Alasan Penolakan</h3>
                </div>
                <p className="text-sm text-red-600/80 leading-relaxed">{data.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar / Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-light-2 shadow-sm sticky top-24">
              
              {/* Price Tag */}
              <div className="mb-6 text-center pb-6 border-b border-light-2/50">
                <span className="text-xs text-dark-2 font-medium block mb-1 uppercase tracking-wide">Biaya Pendaftaran</span>
                <span className={`text-2xl font-bold ${data.cost === 'Gratis' ? 'text-primary' : 'text-dark-1'}`}>
                  {formatCost(data.cost)}
                </span>
              </div>

              {/* Details List mapping DB columns */}
              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-light-1 rounded-lg text-primary shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-2/70 font-semibold uppercase tracking-wider">Batas Akhir</p>
                    <p className="text-sm font-bold text-dark-1">{formatDate(data.deadline)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-light-1 rounded-lg text-primary shrink-0">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-2/70 font-semibold uppercase tracking-wider">Jenjang Pendidikan</p>
                    <p className="text-sm font-bold text-dark-1">{data.education_level}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-light-1 rounded-lg text-primary shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-2/70 font-semibold uppercase tracking-wider">Lokasi</p>
                    <p className="text-sm font-bold text-dark-1">{data.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-light-1 rounded-lg text-primary shrink-0">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-2/70 font-semibold uppercase tracking-wider">Diposting Oleh</p>
                    <p className="text-sm font-bold text-dark-1">User ID: {data.submitted_by}</p>
                    <p className="text-[10px] text-dark-2/60 mt-0.5">Verified by Admin #{data.verified_by}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {data.status === 'published' ? (
                <a 
                  href={data.registration_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-dark-1 text-light-1 text-sm font-bold hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-dark-1/20 hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  Daftar Sekarang
                  <ExternalLink size={16} />
                </a>
              ) : (
                <button disabled className="w-full h-12 rounded-xl bg-light-2 text-dark-2/50 text-sm font-bold cursor-not-allowed border border-light-2">
                  Pendaftaran Ditutup
                </button>
              )}

              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-light-2/30">
                 <button className="text-dark-2/50 hover:text-primary transition-colors text-xs font-medium flex items-center gap-1">
                    <Share2 size={14} /> Share
                 </button>
                 <span className="text-dark-2/30 text-[10px]">
                    Update: {new Date(data.updated_at).toLocaleDateString('id-ID')}
                 </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}