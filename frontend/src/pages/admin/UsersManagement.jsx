import { useEffect, useState } from 'react';
import { Search, Filter, Trash2, ShieldCheck, ShieldAlert, RefreshCw, UserCheck, UserX } from 'lucide-react';
import { apiFetch, getStoredUser } from '../../lib/api';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const currentUser = getStoredUser();

  const isUserVerified = (user) =>
    user.role === 'mitra' ? Boolean(user.partner_verified) : Boolean(user.is_verified);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        search: searchQuery,
      });
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const result = await apiFetch(`/api/users?${params.toString()}`);
      setUsers(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
     const timer = setTimeout(() => {
         fetchUsers();
     }, 500);
     return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleChangeRole = async (userId, newRole) => {
    if(!confirm(`Ubah peran user ID ${userId} menjadi ${newRole}?`)) return;
    try {
      const result = await apiFetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      alert(
        newRole === 'mitra'
          ? 'Peran berhasil diubah. Akun mitra sudah otomatis terverifikasi.'
          : (result.message || 'Peran berhasil diubah')
      );
      fetchUsers();
    } catch (error) {
      alert('Gagal mengubah peran: ' + error.message);
      fetchUsers();
    }
  };

  const handleToggleVerify = async (user) => {
    const nextStatus = !isUserVerified(user);
    if(!confirm(nextStatus ? `Verifikasi ${user.full_name} sebagai mitra?` : `Cabut verifikasi ${user.full_name}?`)) return;
    try {
      await apiFetch(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_verified: nextStatus })
      });
      fetchUsers();
    } catch (error) {
      alert('Gagal memperbarui verifikasi: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if(!confirm('Hapus user ini secara permanen?')) return;
    try {
      await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
      alert('User dihapus');
      fetchUsers();
    } catch (error) {
      alert('Gagal menghapus: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-1">Manajemen Pengguna</h1>
          <p className="text-dark-2 text-sm">Kelola akun siswa, guru, mitra, dan admin.</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-surface border border-light-2 rounded-lg text-dark-1 hover:bg-light-1 transition-colors text-sm font-medium">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-surface p-4 rounded-2xl border border-light-2/50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-2/50" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-light-1 text-dark-1 placeholder:text-dark-2/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-dark-2/50" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="bg-light-1 border-none rounded-lg px-3 py-2 text-sm font-medium text-dark-1 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          >
            <option value="all">Semua Role</option>
            <option value="siswa">Siswa</option>
            <option value="guru_BK">Guru BK</option>
            <option value="mitra">Mitra</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-light-2/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-light-1/50 text-dark-2 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Terdaftar</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-2/30">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-dark-2/50">Memuat data...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-dark-2/50">Tidak ada pengguna ditemukan.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-light-1/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-dark-1">{user.full_name}</td>
                    <td className="px-6 py-4 text-dark-2">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        disabled={currentUser?.id === user.id}
                        title={currentUser?.id === user.id ? 'Tidak bisa mengubah role akun sendiri' : undefined}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="bg-transparent text-dark-1 border border-light-2 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="siswa">Siswa</option>
                        <option value="guru_BK">Guru BK</option>
                        <option value="mitra">Mitra</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {isUserVerified(user) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 text-xs font-bold">
                          <ShieldCheck className="w-3 h-3" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-light-2 text-dark-2 text-xs font-bold">
                          <ShieldAlert className="w-3 h-3" /> Belum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-dark-2/70 text-xs">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.role === 'mitra' && (
                          <button
                            onClick={() => handleToggleVerify(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              isUserVerified(user)
                                ? 'text-yellow-600 hover:bg-yellow-500/10'
                                : 'text-green-600 hover:bg-green-500/10'
                            }`}
                            title={isUserVerified(user) ? 'Cabut Verifikasi Mitra' : 'Verifikasi Mitra'}
                          >
                            {isUserVerified(user) ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={currentUser?.id === user.id}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-light-2/30 flex items-center justify-between bg-light-1/20">
            <span className="text-xs text-dark-2">Halaman {currentPage} dari {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 text-xs font-medium text-dark-1 border border-light-2 rounded-lg disabled:opacity-50 hover:bg-surface transition-colors"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 text-xs font-medium text-dark-1 border border-light-2 rounded-lg disabled:opacity-50 hover:bg-surface transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}