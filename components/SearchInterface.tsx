'use client';

import { useState, useEffect } from 'react';
import SearchFilters from './SearchFilters';
import SearchResults from './SearchResults';

export default function SearchInterface() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    chapter: '',
    ca: '',
    dutiable: '',
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const performSearch = async (searchQuery: string, searchFilters: any, searchPage: number, isAppend: boolean = false) => {
    if (isAppend) {
      if (isSearching) return;
      setIsSearching(true);
    } else {
      setLoading(true);
      setPage(1);
      setHasMore(false);
    }
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: searchFilters.type,
        page: searchPage.toString(),
        limit: '20',
      });

      if (searchFilters.chapter) params.append('chapter', searchFilters.chapter);
      if (searchFilters.ca) params.append('ca', searchFilters.ca);
      if (searchFilters.dutiable) params.append('dutiable', searchFilters.dutiable);

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      
      const receivedHsCount = data.hsCodes?.length || 0;
      const receivedProductCount = data.productCodes?.length || 0;
      const receivedTotal = receivedHsCount + receivedProductCount;
      
      if (isAppend && results) {
        if (receivedTotal === 0) {
          console.log('No new results received, stopping');
          setHasMore(false);
          return;
        }
        
        const updatedResults = {
          ...data,
          hsCodes: [...(results.hsCodes || []), ...(data.hsCodes || [])],
          productCodes: [...(results.productCodes || []), ...(data.productCodes || [])],
        };
        
        setResults(updatedResults);
        
        const totalLoaded = updatedResults.hsCodes.length + updatedResults.productCodes.length;
        const moreAvailable = totalLoaded < data.total;
        console.log(`Page ${searchPage}: Loaded ${totalLoaded} of ${data.total}, hasMore=${moreAvailable}`);
        setHasMore(moreAvailable);
      } else {
        setResults(data);
        const moreAvailable = receivedTotal > 0 && receivedTotal < data.total;
        console.log(`Initial: Loaded ${receivedTotal} of ${data.total}, hasMore=${moreAvailable}`);
        setHasMore(moreAvailable);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleLoadMore = () => {
    if (isSearching || !hasMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, filters, nextPage, true);
  };


  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2 || filters.chapter || filters.ca || filters.dutiable) {
        performSearch(query, filters, 1, false);
      } else if (query.length === 0 && !filters.chapter && !filters.ca && !filters.dutiable) {
        setResults(null);
        setHasMore(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, filters, 1, false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search HS Code or Product Code
            </label>
            <input
              id="search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter HS code, product code, or description..."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <SearchFilters filters={filters} setFilters={setFilters} />
        </form>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Searching...</p>
        </div>
      )}

      {!loading && results && (
        <SearchResults 
          results={results}
          page={page}
          setPage={setPage}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isSearching={isSearching}
        />
      )}

      {!loading && !results && query.length > 0 && query.length < 2 && (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
          Please enter at least 2 characters to search
        </div>
      )}
    </div>
  );
}
