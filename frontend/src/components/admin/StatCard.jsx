import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, trend, trendLabel, icon: Icon, colorClass }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-light-2/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-dark-2 text-sm font-medium mb-1">{title}</h3>
      <p className="text-dark-1 text-2xl font-bold">{value}</p>
      {trendLabel && <p className="text-xs text-dark-2/50 mt-1">{trendLabel}</p>}
    </div>
  );
}