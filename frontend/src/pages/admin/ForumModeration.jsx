import { useEffect, useState } from 'react';
import { Trash2, Eye, MessageSquare, Heart } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function ForumModeration() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await apiFetch('/api/forum?limit=50&type=discussion');
      setPosts(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if(!confirm('Hapus post ini? Ini akan ditandai sebagai deleted.')) return;
    try {
      await apiFetch(`/api/forum/${id}`, { method: 'DELETE' });
      alert('Post dihapus');
      fetchPosts();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-1">Moderasi Forum</h1>
        <p className="text-dark-2 text-sm">Pantau diskusi komunitas dan hapus konten spam/tidak pantas.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-light-2/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-light-1/50 text-dark-2 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Judul Diskusi</th>
                <th className="px-6 py-4">Penulis</th>
                <th className="px-6 py-4">Statistik</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-2/30">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-dark-2/50">Memuat...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-dark-2/50">Tidak ada diskusi aktif.</td></tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-light-1/30 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-bold text-dark-1 truncate">{post.title}</p>
                      <p className="text-xs text-dark-2/50 truncate mt-1">{post.content.substring(0, 50)}...</p>
                    </td>
                    <td className="px-6 py-4 text-dark-2">{post.user_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs text-dark-2/70">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3"/> {post.like_count}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/> {post.comment_count}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {post.view_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-2/70 text-xs">
                      {new Date(post.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Hapus Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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