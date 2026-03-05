'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalHsCodes: number;
  totalProductCodes: number;
  totalCAs: number;
  dutiableCount: number;
  nonDutiableCount: number;
  totalMappings: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: 'HS Codes', value: stats.totalHsCodes.toLocaleString(), color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Product Codes', value: stats.totalProductCodes.toLocaleString(), color: 'text-green-600 dark:text-green-400' },
    { label: 'Authorities', value: stats.totalCAs.toLocaleString(), color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Dutiable', value: stats.dutiableCount.toLocaleString(), color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Non-Dutiable', value: stats.nonDutiableCount.toLocaleString(), color: 'text-teal-600 dark:text-teal-400' },
    { label: 'Mappings', value: stats.totalMappings.toLocaleString(), color: 'text-pink-600 dark:text-pink-400' },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{item.label}</div>
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}
