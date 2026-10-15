import { useEffect, useState } from 'react';
import { Users, Briefcase, ClipboardList, MessageSquare, Activity, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../../lib/api';
import StatCard from '../../components/admin/StatCard';

export default function Dashboard() {
    const [stats, setStats] = useState({ users: 0, partners: 0, opportunities: 0, forumPosts: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [usersRes, partnersRes, oppsRes, forumRes] = await Promise.all([
                    apiFetch('/api/users?page=1&limit=1'),
                    apiFetch('/api/partners'),
                    apiFetch('/api/opportunities?page=1&limit=1'),
                    apiFetch('/api/forum?page=1&limit=1')
                ]);
                setStats({
                    users: usersRes.pagination?.total || 0,
                    partners: Array.isArray(partnersRes.data) ? partnersRes.data.length : 0,
                    opportunities: oppsRes.pagination?.total || 0,
                    forumPosts: forumRes.pagination?.total || 0
                });
                const [latestUsers, latestOpps] = await Promise.all([
                    apiFetch('/api/users?page=1&limit=3&sort=newest'),
                    apiFetch('/api/opportunities?page=1&limit=3&sort=newest')
                ]);
                const activity = [
                    ...latestUsers.data.map(u => ({ type: 'user', action: 'Registrasi Baru', detail: u.full_name, time: u.created_at })),
                    ...latestOpps.data.map(o => ({ type: 'opportunity', action: 'Peluang Dibuat', detail: o.title, time: o.created_at }))
                ].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
                setRecentActivity(activity);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64"><Activity className="animate-spin w-8 h-8 text-accent"/></div>;

    const container = {
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } }
    };
    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <motion.div variants={item}>
                <h1 className="text-2xl font-bold text-dark-1">Dashboard Overview</h1>
                <p className="text-dark-2 text-sm">Ringkasan aktivitas platform Bekal Opat.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Pengguna"
                    value={stats.users}
                    icon={Users}
                    colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
                    trend={12}
                    trendLabel="+12% minggu ini"
                />
                <StatCard
                    title="Partner Terdaftar"
                    value={stats.partners}
                    icon={Briefcase}
                    colorClass="bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300"
                    trend={5}
                    trendLabel="+5% bulan ini"
                />
                <StatCard
                    title="Peluang Aktif"
                    value={stats.opportunities}
                    icon={ClipboardList}
                    colorClass="bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
                    trend={-2}
                    trendLabel="-2% karena deadline"
                />
                <StatCard
                    title="Diskusi Forum"
                    value={stats.forumPosts}
                    icon={MessageSquare}
                    colorClass="bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-300"
                    trend={18}
                    trendLabel="+18% engagement"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={item} className="lg:col-span-2 bg-surface rounded-2xl border border-light-2/50 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-dark-1 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent" />
                        Aktivitas Terbaru
                    </h3>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-dark-2/50 text-sm text-center py-8">Belum ada aktivitas terbaru.</p>
                        ) : (
                            recentActivity.map((activity, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-start gap-4 pb-4 border-b border-light-2/30 last:border-0 last:pb-0"
                                >
                                    <div className={`mt-1 p-2 rounded-full ${
                                        activity.type === 'user'
                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'
                                            : 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300'
                                    }`}>
                                        {activity.type === 'user' ? <Users className="w-4 h-4"/> : <ClipboardList className="w-4 h-4"/>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-dark-1">{activity.action}: <span className="font-normal text-dark-2">{activity.detail}</span></p>
                                        <p className="text-xs text-dark-2/50 mt-1">{new Date(activity.time).toLocaleString('id-ID')}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
                <motion.div variants={item} className="bg-surface rounded-2xl border border-light-2/50 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-dark-1 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Perlu Perhatian
                        </h3>
                        <p className="text-sm text-dark-2 mb-6">Item yang menunggu verifikasi admin.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl border border-yellow-100 dark:border-yellow-500/20">
                                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Menunggu Verifikasi Partner</span>
                                <span className="text-xs font-bold bg-yellow-200 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 px-2 py-1 rounded">Cek Tab Partners</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20">
                                <span className="text-sm font-medium text-orange-800 dark:text-orange-300">Peluang Status Pending</span>
                                <span className="text-xs font-bold bg-orange-200 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 px-2 py-1 rounded">Cek Tab Opportunities</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-light-2/30">
                        <p className="text-xs text-dark-2/50 text-center">Sistem Otomatis Memverifikasi Data Valid</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}