import { Search, Plus } from 'lucide-react';

export default function Hero() {
    return (
        <div className="bg-primary min-h-dvh flex flex-col items-center justify-center px-4 py-12 relative">
            <div className="w-full max-w-3xl mx-auto text-center space-y-6">
                
                {/* Badge: Ukuran lebih kecil */}
                <div className="flex justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-light-1/10 text-light-1 border border-light-1/20 text-xs font-medium backdrop-blur-sm">
                        100% Informasi Terverifikasi Bebas Hoax
                    </span>
                </div>

                {/* Headline: Dikecilkan dari 4xl/5xl/6xl menjadi 3xl/4xl/5xl */}
                <h1 className="text-light-1 font-bold leading-tight tracking-tight text-3xl md:text-4xl lg:text-5xl">
                    Satu Tempat untuk Beasiswa, Karir, <br className="hidden md:block" />
                    & Lomba Pelajar
                </h1>

                {/* Deskripsi: Dikecilkan dari base/lg menjadi sm/base */}
                <p className="text-light-2 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                    Temukan ribuan peluang pengembangan diri, kompetisi nasional, dan lowongan 
                    kerja/magang terverifikasi untuk para pelajar di seluruh Indonesia.
                </p>

                {/* Search Bar & Action Area */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-6 w-full max-w-2xl mx-auto">
                    
                    {/* Input Group: Tinggi dikurangi dari h-14 ke h-12 */}
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-dark-2/60 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari beasiswa, lomba coding, atau magang..." 
                            className="w-full h-12 pl-11 pr-4 rounded-full bg-light-1 text-dark-1 placeholder:text-dark-2/50 focus:outline-none focus:ring-4 focus:ring-light-2/20 transition-all shadow-lg text-sm font-medium"
                        />
                    </div>

                    {/* Tombol Aksi: Tinggi dikurangi dari h-14 ke h-12, padding disesuaikan */}
                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                        <button className="h-12 px-6 rounded-full bg-dark-1 text-light-1 font-semibold hover:bg-dark-2 transition-colors shadow-lg whitespace-nowrap w-full md:w-auto text-sm">
                            Cari Peluang
                        </button>
                        
                        <button className="h-12 px-5 rounded-full bg-light-1 text-primary font-semibold hover:bg-light-2 transition-all shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap w-full md:w-auto text-sm">
                            <Plus className="w-4 h-4" />
                            <span>Buat Info</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}