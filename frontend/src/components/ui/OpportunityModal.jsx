import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch, getStoredUser } from '../../lib/api';
import ImageUploader from './ImageUploader';

export default function OpportunityModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        category_id: '',
        organizer_name: '',
        description: '',
        requirements: '',
        education_level: 'Umum',
        location: '',
        cost: '',
        registration_link: '',
        deadline: '',
        image_url: null
    });
    const [displayCost, setDisplayCost] = useState('');
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const user = getStoredUser();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchCategories();
        } else {
            document.body.style.overflow = 'unset';
            resetForm();
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const result = await apiFetch('/api/categories');
            setCategories(result.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '', category_id: '', organizer_name: '', description: '', requirements: '',
            education_level: 'Umum', location: '', cost: '', registration_link: '', deadline: '', image_url: null
        });
        setDisplayCost('');
        setError(null);
        setSuccess(false);
    };

    const formatRupiahInput = (value) => {
        if (!value && value !== 0) return '';
        const numValue = typeof value === 'string' ? value.replace(/\D/g, '') : value.toString();
        if (numValue === '') return '';
        const number = parseInt(numValue, 10);
        if (isNaN(number)) return '';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(number);
    };

    const handleCostChange = (e) => {
        const rawValue = e.target.value;
        const numericValue = rawValue.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, cost: numericValue }));
        setDisplayCost(formatRupiahInput(numericValue));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !['admin', 'guru_BK', 'mitra'].includes(user.role)) {
            setError('Akses ditolak.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const payload = {
                ...formData,
                image_url: formData.image_url || null,
                category_id: parseInt(formData.category_id),
                deadline: formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : null,
                cost: formData.cost ? parseInt(formData.cost, 10) : 0
            };
            if (!formData.registration_link || formData.registration_link.trim() === '') {
                delete payload.registration_link;
            }
            await apiFetch('/api/opportunities', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Gagal mengirim data.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-light-1 border-none rounded-xl text-sm text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-dark-2/40 transition-all";
    const labelClass = "block text-xs font-semibold text-dark-2 mb-1.5";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !isLoading && onClose()}
                    ></motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="relative w-full max-w-5xl max-h-[92vh] bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-light-2/50 bg-light-1/30 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-dark-1">Ajukan Informasi Peluang</h2>
                                <p className="text-xs text-dark-2/70 mt-0.5">Data akan menunggu verifikasi admin.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-light-2 rounded-full transition-colors text-dark-2 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form id="opportunity-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 rounded-r-lg flex gap-3 items-start"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 border-l-4 border-green-500 rounded-r-lg flex gap-3 items-start"
                                >
                                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">Berhasil dikirim! Menunggu verifikasi.</p>
                                </motion.div>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-dark-2 uppercase tracking-wide border-b border-light-2 pb-2">Informasi Dasar</h3>
                                    <div className="lg:col-span-2">
                                        <label className={labelClass}>Judul Peluang *</label>
                                        <input type="text" name="title" required value={formData.title} onChange={handleChange} className={inputClass} placeholder="Contoh: Beasiswa S1 2026" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Kategori *</label>
                                            <select name="category_id" required value={formData.category_id} onChange={handleChange} className={`${inputClass} cursor-pointer appearance-none`}>
                                                <option value="">Pilih</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Jenjang</label>
                                            <select name="education_level" value={formData.education_level} onChange={handleChange} className={`${inputClass} cursor-pointer appearance-none`}>
                                                <option value="Umum">Umum</option>
                                                <option value="SMA/SMK">SMA/SMK</option>
                                                <option value="D3">D3</option>
                                                <option value="S1">S1</option>
                                                <option value="S2">S2</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Penyelenggara *</label>
                                        <input type="text" name="organizer_name" required value={formData.organizer_name} onChange={handleChange} className={inputClass} placeholder="Nama Instansi" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Lokasi</label>
                                            <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="Online / Kota" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Biaya</label>
                                            <input
                                                type="text"
                                                name="cost_display"
                                                value={displayCost}
                                                onChange={handleCostChange}
                                                inputMode="numeric"
                                                className={`${inputClass} font-mono`}
                                                placeholder="Rp 0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Deadline *</label>
                                        <input type="date" name="deadline" required min={new Date().toISOString().split('T')[0]} value={formData.deadline} onChange={handleChange} className={inputClass} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-dark-2 uppercase tracking-wide border-b border-light-2 pb-2">Detail & Media</h3>
                                    <div>
                                        <label className={labelClass}>Link Registrasi</label>
                                        <input type="url" name="registration_link" value={formData.registration_link} onChange={handleChange} className={inputClass} placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Deskripsi *</label>
                                        <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Jelaskan detail peluang..." />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Persyaratan</label>
                                        <textarea name="requirements" rows={3} value={formData.requirements} onChange={handleChange} className={`${inputClass} resize-none`} placeholder={"- IPK Min 3.0\n- Essay"} />
                                    </div>
                                    <ImageUploader
                                        value={formData.image_url}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                        label="Thumbnail (Opsional)"
                                    />
                                </div>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t border-light-2/50 bg-light-1/30 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-dark-2 hover:bg-light-2 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                form="opportunity-form"
                                disabled={isLoading || success}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-dark hover:bg-dark-1 hover:text-light-1 transition-all shadow-lg disabled:opacity-70 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                                ) : success ? (
                                    <><CheckCircle className="w-4 h-4" /> Terkirim</>
                                ) : (
                                    'Kirim Permohonan'
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}