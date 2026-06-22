'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { Image as ImageIcon, Zap, Coins, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/lib/i18n';

export default function StatisticsProfilePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/profile/statistics');
        setStats(data);
      } catch (error) {
        toast.error('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl">
        <div className="h-8 w-48 bg-black/[0.05] dark:bg-white/10 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-32 bg-black/[0.05] dark:bg-white/10 rounded-2xl" />
          <div className="h-32 bg-black/[0.05] dark:bg-white/10 rounded-2xl" />
          <div className="h-32 bg-black/[0.05] dark:bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Generations',
      value: stats?.totalGenerations || 0,
      icon: ImageIcon,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: 'Successful',
      value: stats?.successfulGenerations || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      title: 'Credits Spent',
      value: stats?.spentCredits || 0,
      icon: Coins,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      title: 'Favorite Model',
      value: stats?.favoriteModel || 'None',
      icon: Zap,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      title: 'Member Since',
      value: stats?.registeredAt ? format(new Date(stats.registeredAt), 'MMM yyyy') : 'Unknown',
      icon: Calendar,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10'
    },
    {
      title: 'Current Balance',
      value: stats?.currentCredits || 0,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold mb-1">{t('profile.statistics.title')}</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm">{t('profile.statistics.desc')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:bg-black/[0.05] dark:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-gray-400">{card.title}</h3>
              </div>
              <p className="text-3xl font-semibold text-slate-900 dark:text-slate-900 dark:text-white truncate">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
