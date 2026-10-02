import { Search, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../../lib/api';

export default function Hero() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState(() => getStoredUser());
    const canCompose = Boolean(user) && ['admin', 'guru_BK', 'mitra'].includes(user.role);

    useEffect(() => {
        const syncUser = () => setUser(getStoredUser());
        window.addEventListener('bekal-auth-change', syncUser);
        window.addEventListener('storage', syncUser);
        return () => {
            window.removeEventListener('bekal-auth-change', syncUser);
            window.removeEventListener('storage', syncUser);
        };
    }, []);

    return (
        <div className="bg-primary min-h-dvh flex flex-col items-center justify-center px-4 py-12 relative">
            <div className="w-full max-w-3xl mx-auto text-center space-y-6">

                <div className="flex justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-on-dark/10 text-on-dark border border-on-dark/20 text-xs font-medium backdrop-blur-sm">
                        100% Informasi Terverifikasi Bebas Hoax
                    </span>
                </div>

                <h1 className="text-on-dark font-bold leading-tight tracking-tight text-3xl md:text-4xl lg:text-5xl">
                    Satu Tempat untuk Beasiswa, Karir, <br className="hidden md:block" />
                    & Lomba Pelajar
                </h1>

                <p className="text-on-dark/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                    Temukan ribuan peluang pengembangan diri, kompetisi nasional, dan lowongan
                    kerja/magang terverifikasi untuk para pelajar di seluruh Indonesia.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-6 w-full max-w-2xl mx-auto">

                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-dark-2/60 group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                          type="text"
                          placeholder="Cari beasiswa, lomba coding, atau magang..."
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/bekal?search=${encodeURIComponent(query)}`); }}
                          className="w-full h-12 pl-11 pr-4 rounded-full bg-surface text-dark-1 placeholder:text-dark-2/50 focus:outline-none focus:ring-4 focus:ring-on-dark/20 transition-all shadow-lg text-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                        <button onClick={() => navigate(`/bekal?search=${encodeURIComponent(query)}`)} className="h-12 px-6 rounded-full bg-dark-1 text-light-1 font-semibold hover:bg-dark-2 transition-colors shadow-lg whitespace-nowrap w-full md:w-auto text-sm">
                            Cari Peluang
                        </button>

                        {canCompose && (
                            <button onClick={() => navigate('/bekal?compose=1')} className="h-12 px-5 rounded-full bg-surface text-accent font-semibold hover:bg-light-2 transition-all shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap w-full md:w-auto text-sm">
                                <Plus className="w-4 h-4" />
                                <span>Buat Info</span>
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}