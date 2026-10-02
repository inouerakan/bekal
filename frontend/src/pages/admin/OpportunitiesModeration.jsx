import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Calendar, MapPin, User, Trash2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function OpportunitiesModeration() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const result = await apiFetch(`/api/opportunities/all?${params.toString()}`);
      setOpportunities(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [statusFilter]);

  const handleAction = async (id, action, reason = '') => {
    if (action === 'reject' && !reason) {
      reason = prompt('Alasan penolakan:');
      if (reason === null) return;
    }
    try {
      await apiFetch(`/api/opportunities/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          rejection_reason: reason || null
        })
      });
      alert(`Peluang berhasil di-${action}`);
      fetchOpportunities();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Hapus peluang "${title}" secara permanen? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await apiFetch(`/api/opportunities/${id}`, { method: 'DELETE' });
      alert('Peluang berhasil dihapus');
      fetchOpportunities();
    } catch (error) {
      alert('Gagal menghapus: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-1">Moderasi Peluang</h1>
          <p className="text-dark-2 text-sm">Review dan verifikasi informasi beasiswa/lomba/magang.</p>
        </div>
        <div className="flex gap-2 bg-surface p-1 rounded-xl border border-light-2/50">
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                statusFilter === s ? 'bg-primary text-on-dark' : 'text-dark-2 hover:bg-light-1'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-dark-2/50">Memuat peluang...</div>
        ) : opportunities.length === 0 ? (
          <div className="col-span-full text-center py-12 text-dark-2/50">Tidak ada data untuk ditampilkan.</div>
        ) : (
          opportunities.map((opp) => (
            <div key={opp.id} className="bg-surface rounded-2xl border border-light-2/50 p-5 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                  opp.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' :
                  opp.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300'
                }`}>
                  {opp.status}
                </span>
                <span className="text-[10px] text-dark-2/50">{opp.category_name}</span>
              </div>
              
              <h3 className="text-dark-1 font-bold text-base mb-2 line-clamp-2">{opp.title}</h3>
              <p className="text-dark-2 text-xs mb-4 line-clamp-3 flex-1">{opp.description}</p>
              
              <div className="space-y-2 text-xs text-dark-2/70 mb-4">
                <div className="flex items-center gap-2"><Calendar className="w-3 h-3"/> Deadline: {new Date(opp.deadline).toLocaleDateString('id-ID')}</div>
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3"/> {opp.location}</div>
                <div className="flex items-center gap-2"><User className="w-3 h-3"/> Oleh: {opp.submitted_by_name || '-'}</div>
              </div>

              <div className="pt-4 border-t border-light-2/30 mt-auto space-y-2">
                {opp.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(opp.id, 'approve')}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3"/> Approve
                    </button>
                    <button
                      onClick={() => handleAction(opp.id, 'reject')}
                      className="flex-1 py-2 bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3 h-3"/> Reject
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => handleDelete(opp.id, opp.title)}
                  className="w-full py-2 bg-light-1 hover:bg-red-50 text-dark-2 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 border border-light-2 hover:border-red-200 dark:hover:border-red-500/30 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3"/> Hapus Permanen
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}