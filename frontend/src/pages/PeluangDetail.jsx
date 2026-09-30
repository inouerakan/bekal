import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
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

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiFetch(`/api/opportunities/${id}`)
      .then((result) => { if (!cancelled) setData(result.data); })
      .catch((fetchError) => { if (!cancelled) setError(fetchError.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

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
      case 'approved':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 text-xs font-bold"><CheckCircle2 size={12}/> Terverifikasi</span>;
      case 'pending':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300 text-xs font-bold"><Clock size={12}/> Menunggu Verifikasi</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300 text-xs font-bold"><AlertCircle size={12}/> Ditolak</span>;
      default:
        return null;
    }
  };

  if (isLoading) return <div className="pt-24 text-center text-dark-2">Memuat detail peluang...</div>;
  if (!data) return <div className="pt-24 text-center text-dark-2">{error || 'Peluang tidak ditemukan.'}</div>;

  return (
    <div className="pt-20 min-h-screen bg-light-1 pb-12">

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-surface p-6 md:p-8 rounded-2xl border border-light-2 shadow-sm relative overflow-hidden">

              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 p-2 rounded-full bg-light-1 hover:bg-primary/10 text-dark-2 hover:text-accent transition-all duration-200 group z-10 border border-light-2/50"
                title="Kembali"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="absolute top-4 right-4 text-[10px] text-dark-2 flex items-center gap-1 bg-light-1 px-2.5 py-1 rounded-full border border-light-2/50">
                <Eye size={12} />
                <span className="font-medium">{data.view_count}</span>
              </div>

              <div className="mt-8 mb-4">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 bg-primary/10 text-accent text-[10px] uppercase tracking-wider font-bold rounded-md border border-primary/20">
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

              <div className="prose prose-sm max-w-none text-dark-2 leading-relaxed">
                <h3 className="text-dark-1 font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                  Deskripsi
                </h3>
                <p className="whitespace-pre-line text-justify text-sm md:text-base">{data.description}</p>
              </div>
            </div>

            <div className="bg-surface p-6 md:p-8 rounded-2xl border border-light-2 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary/10 rounded-lg text-accent">
                  <FileText size={18} />
                </div>
                <h3 className="text-dark-1 font-bold text-sm uppercase tracking-wide">Persyaratan</h3>
              </div>
              <div className="text-sm text-dark-2 whitespace-pre-line leading-relaxed bg-light-1/50 p-5 rounded-xl border border-light-2/50 font-medium">
                {data.requirements || "Tidak ada persyaratan khusus yang tercantum."}
              </div>
            </div>

            {data.status === 'rejected' && data.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-2xl border border-red-100 dark:border-red-500/20 animate-fade-in">
                <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-300">
                  <AlertCircle size={18} />
                  <h3 className="font-bold text-sm">Alasan Penolakan</h3>
                </div>
                <p className="text-sm text-red-600/80 dark:text-red-300/80 leading-relaxed">{data.rejection_reason}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface p-6 rounded-2xl border border-light-2 shadow-sm sticky top-24">

              <div className="mb-6 text-center pb-6 border-b border-light-2/50">
                <span className="text-xs text-dark-2 font-medium block mb-1 uppercase tracking-wide">Biaya Pendaftaran</span>
                <span className={`text-2xl font-bold ${data.cost === 'Gratis' ? 'text-accent' : 'text-dark-1'}`}>
                  {formatCost(data.cost)}
                </span>
              </div>

              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-light-1 rounded-lg text-accent shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-2/70 font-semibold uppercase tracking-wider">Batas Akhir</p>
                    <p className="text-sm font-bold text-dark-1">{formatDate(data.deadline)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-light-1 rounded-lg text-accent shrink-0">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-2/70 font-semibold uppercase tracking-wider">Jenjang Pendidikan</p>
                    <p className="text-sm font-bold text-dark-1">{data.education_level}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-light-1 rounded-lg text-accent shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-2/70 font-semibold uppercase tracking-wider">Lokasi</p>
                    <p className="text-sm font-bold text-dark-1">{data.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-light-1 rounded-lg text-accent shrink-0">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-dark-2/70 font-semibold uppercase tracking-wider">Diposting Oleh</p>
                    <p className="text-sm font-bold text-dark-1">User ID: {data.submitted_by}</p>
                    <p className="text-[10px] text-dark-2/60 mt-0.5">Verified by Admin #{data.verified_by}</p>
                  </div>
                </div>
              </div>

              {data.status === 'published' || data.status === 'approved' ? (
                <a
                  href={data.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-dark-1 text-light-1 text-sm font-bold hover:bg-primary hover:text-on-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:shadow-primary/30 hover:-translate-y-0.5"
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
                 <button className="text-dark-2/50 hover:text-accent transition-colors text-xs font-medium flex items-center gap-1">
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