'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { MonitorPlay, LogIn, Image as ImageIcon, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useUIStore } from '@/store';

export default function ActivityProfilePage() {
  const { t } = useTranslation();
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get('/profile/activity?limit=100');
        setActivity(data.items || []);
      } catch (error) {
        toast.error('Failed to load activity history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl">
        <div className="h-8 w-48 bg-black/[0.05] dark:bg-white/10 rounded-lg" />
        <div className="h-64 bg-black/[0.05] dark:bg-white/10 rounded-2xl" />
      </div>
    );
  }

  const totalPages = Math.ceil(activity.length / itemsPerPage) || 1;
  const paginatedActivity = activity.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getIcon = (type: string) => {
    switch (type) {
      case 'GENERATION': return <ImageIcon className={cn("w-5 h-5", isLuxury ? "text-[#D4AF37]" : "text-blue-400")} />;
      case 'LOGIN': return <LogIn className={cn("w-5 h-5", isLuxury ? "text-[#D4AF37]" : "text-green-400")} />;
      default: return <MonitorPlay className="w-5 h-5 text-slate-500 dark:text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
      case 'SUCCESS': 
        return <CheckCircle className={cn("w-4 h-4", isLuxury ? "text-[#D4AF37]" : "text-green-500")} />;
      case 'ERROR':
      case 'FAILED': 
        return <XCircle className={cn("w-4 h-4", isLuxury ? "text-[#D4AF37]" : "text-red-500")} />;
      default: 
        return <Clock className={cn("w-4 h-4", isLuxury ? "text-[#D4AF37]" : "text-amber-500")} />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold mb-1">{t('profile.activity.title')}</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm">{t('profile.activity.desc')}</p>
      </div>

      <div className="bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden">
        {activity.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-gray-500">
            No recent activity found.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {paginatedActivity.map((item, idx) => (
              <div key={item.id || idx} className="p-4 hover:bg-black/[0.03] dark:bg-white/5 transition-colors flex items-center gap-4">
                <div className="p-3 bg-black/[0.03] dark:bg-white/5 rounded-xl shrink-0">
                  {getIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-white truncate">
                    {item.action}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    {format(new Date(item.date), 'MMM d, yyyy • HH:mm')}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 px-3 py-1 bg-black/[0.03] dark:bg-white/5 rounded-full text-xs font-medium">
                  {getStatusIcon(item.status)}
                  <span className={cn(
                    item.status === 'DONE' || item.status === 'SUCCESS' ? 'text-green-500' :
                    item.status === 'ERROR' || item.status === 'FAILED' ? 'text-red-500' : 'text-amber-500'
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activity.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 outline-none focus:border-slate-400 dark:focus:border-gray-500 text-slate-900 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 disabled:opacity-50 hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors text-sm"
              >
                {t('common.prev')}
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center text-sm ${
                      currentPage === pageNum
                        ? (isLuxury ? 'bg-[#D4AF37] text-black font-bold' : 'bg-indigo-600 text-white font-bold shadow-md dark:shadow-none')
                        : 'border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.05] dark:hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 disabled:opacity-50 hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors text-sm"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
