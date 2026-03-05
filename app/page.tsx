'use client';

import { useState, useEffect } from 'react';
import SearchInterface from '@/components/SearchInterface';
import StatsBar from '@/components/StatsBar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Singapore Customs HS Code Search
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Search for HS codes, product codes, and competent authority information
          </p>
        </header>
        
        <StatsBar />
        <SearchInterface />
      </div>
    </div>
  );
}
