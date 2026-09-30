import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Building2, Mail, Phone, Eye } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function PartnersManagement() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const result = await apiFetch('/api/partners');
      setPartners(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleVerify = async (id, status) => {
    if(!confirm(status ? 'Setujui partner ini?' : 'Tolak/Sembunyikan partner ini?')) return;
    try {
      await apiFetch(`/api/partners/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ is_verified_partner: status })
      });
      alert('Status diperbarui');
      fetchPartners();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-1">Manajemen Mitra</h1>
        <p className="text-dark-2 text-sm">Verifikasi organisasi penyelenggara peluang.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-light-2/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-light-1/50 text-dark-2 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Organisasi</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-2/30">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-dark-2/50">Memuat...</td></tr>
              ) : partners.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-dark-2/50">Tidak ada mitra terdaftar.</td></tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-light-1/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-accent">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-dark-1">{partner.organization_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-2">{partner.partner_type}</td>
                    <td className="px-6 py-4 text-dark-2/70 text-xs space-y-1">
                      <div className="flex items-center gap-1"><Mail className="w-3 h-3"/>{partner.contact_email}</div>
                      {partner.contact_phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3"/>{partner.contact_phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                       {partner.is_verified_partner ? (
                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 text-xs font-bold">
                           <CheckCircle className="w-3 h-3" /> Terverifikasi
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300 text-xs font-bold">
                           <Eye className="w-3 h-3" /> Menunggu
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!partner.is_verified_partner && (
                          <button
                            onClick={() => handleVerify(partner.id, true)}
                            className="p-2 text-green-600 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Verifikasi"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {partner.is_verified_partner && (
                          <button
                            onClick={() => handleVerify(partner.id, false)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Cabut Verifikasi"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-dark-2/50 italic">*Catatan: Saat ini API hanya mengembalikan mitra yang sudah terverifikasi. Untuk melihat pending, backend perlu disesuaikan.</p>
    </div>
  );
}