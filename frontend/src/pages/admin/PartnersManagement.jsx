import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Building2, Mail, Phone, Eye, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const tabs = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'verified', label: 'Terverifikasi' },
];

export default function PartnersManagement() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const query = params.toString();
      const result = await apiFetch(`/api/partners/all${query ? `?${query}` : ''}`);
      setPartners(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const handleVerify = async (id, status) => {
    if (!confirm(status ? 'Verifikasi mitra ini?' : 'Cabut verifikasi mitra ini?')) return;
    setBusyId(id);
    try {
      await apiFetch(`/api/partners/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ is_verified_partner: status }),
      });
      fetchPartners();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = partners.filter((partner) => !partner.is_verified_partner).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-1">Manajemen Mitra</h1>
          <p className="text-dark-2 text-sm">Verifikasi organisasi penyelenggara peluang.</p>
        </div>
        <button
          onClick={fetchPartners}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-light-2 rounded-lg text-dark-1 hover:bg-light-1 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
              statusFilter === tab.key
                ? 'bg-primary text-on-dark border-primary shadow-md'
                : 'bg-surface text-dark-2 border-light-2/30 hover:bg-light-2/20 hover:text-dark-1'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {statusFilter === 'all' && pendingCount > 0 && (
          <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
            {pendingCount} mitra menunggu verifikasi
          </span>
        )}
      </div>

      <div className="bg-surface rounded-2xl border border-light-2/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-light-1/50 text-dark-2 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Organisasi</th>
                <th className="px-6 py-4">Pemilik Akun</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-2/30">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-dark-2/50">Memuat...</td></tr>
              ) : partners.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-dark-2/50">Tidak ada mitra pada filter ini.</td></tr>
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
                    <td className="px-6 py-4 text-xs">
                      <p className="font-medium text-dark-1">{partner.user_name || '-'}</p>
                      <p className="text-dark-2/70">{partner.user_email || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-dark-2">{partner.partner_type}</td>
                    <td className="px-6 py-4 text-dark-2/70 text-xs space-y-1">
                      <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{partner.contact_email}</div>
                      {partner.contact_phone && (
                        <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{partner.contact_phone}</div>
                      )}
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
                            disabled={busyId === partner.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-500/15 dark:hover:bg-green-500/25 rounded-lg transition-colors disabled:opacity-50"
                            title="Verifikasi"
                          >
                            <CheckCircle className="w-4 h-4" /> Verifikasi
                          </button>
                        )}
                        {partner.is_verified_partner && (
                          <button
                            onClick={() => handleVerify(partner.id, false)}
                            disabled={busyId === partner.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Cabut Verifikasi"
                          >
                            <XCircle className="w-4 h-4" /> Cabut
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
    </div>
  );
}