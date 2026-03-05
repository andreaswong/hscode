'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchResultsProps {
  results: any;
  page: number;
  setPage: (page: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isSearching?: boolean;
}

export default function SearchResults({ results, page, setPage, onLoadMore, hasMore, isSearching }: SearchResultsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'hs' | 'product'>('hs');
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingLock = useRef(false);
  
  // Use refs to avoid recreating listener
  const hasMoreRef = useRef(hasMore);
  const isSearchingRef = useRef(isSearching);
  const onLoadMoreRef = useRef(onLoadMore);

  // Update refs when props change
  useEffect(() => {
    hasMoreRef.current = hasMore;
    isSearchingRef.current = isSearching;
    onLoadMoreRef.current = onLoadMore;
    
    // Reset lock when search completes
    if (!isSearching) {
      loadingLock.current = false;
    }
  }, [hasMore, isSearching, onLoadMore]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Simple scroll listener - only created once
  useEffect(() => {
    const handleScroll = () => {
      // Use refs to get current values
      if (!hasMoreRef.current || isSearchingRef.current || loadingLock.current) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Trigger when 200px from bottom
      if (scrollTop + windowHeight >= docHeight - 200) {
        loadingLock.current = true;
        if (onLoadMoreRef.current) {
          onLoadMoreRef.current();
        }
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []); // Empty deps - only create once

  const hsCount = results.hsCodes?.length || 0;
  const productCount = results.productCodes?.length || 0;
  const loadedCount = hsCount + productCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Search Results ({loadedCount.toLocaleString()}{results.total > loadedCount ? ` of ${results.total.toLocaleString()}` : ''})
        </h2>
      </div>

      {/* Tabs */}
      {hsCount > 0 && productCount > 0 && (
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('hs')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'hs'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              HS Codes ({hsCount})
            </button>
            <button
              onClick={() => setActiveTab('product')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'product'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Product Codes ({productCount})
            </button>
          </div>
        </div>
      )}

      {/* HS Codes Tab */}
      {results.hsCodes && results.hsCodes.length > 0 && (activeTab === 'hs' || productCount === 0) && (
        <div>
          {productCount === 0 && (
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              HS Codes ({results.hsCodes.length})
            </h3>
          )}
          <div className="space-y-3">
            {results.hsCodes.map((hsCode: any) => (
              <div
                key={hsCode.hsCode}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                        {hsCode.hsCode}
                      </span>
                      {hsCode.isDutiable && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                          Dutiable {hsCode.dutyRate && `(${hsCode.dutyRate}%)`}
                        </span>
                      )}
                      {hsCode.category && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {hsCode.category}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-2">{hsCode.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(() => {
                        const validControls = hsCode.hsCaControls?.filter((control: any) => 
                          control.caRelation.caCode !== '-' && control.caRelation.caCode.trim() !== ''
                        ) || [];
                        
                        return validControls.length > 0 ? (
                          validControls.map((control: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                            >
                              {control.caRelation.caCode}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            UNCONTROLLED
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(`hs-${hsCode.hsCode}`)}
                    className="ml-4 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                  >
                    {expandedItems.has(`hs-${hsCode.hsCode}`) ? 'Hide' : 'Details'}
                  </button>
                </div>

                {expandedItems.has(`hs-${hsCode.hsCode}`) && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Hierarchy</h4>
                        <div className="space-y-1 text-slate-600 dark:text-slate-400">
                          <div>Chapter: {hsCode.chapter}</div>
                          <div>Heading: {hsCode.heading}</div>
                          <div>Subheading: {hsCode.subheading}</div>
                        </div>
                      </div>
                      {hsCode.hsProductMappings && hsCode.hsProductMappings.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                            Related Product Codes ({hsCode.hsProductMappings.length})
                          </h4>
                          <div className="space-y-1">
                            {hsCode.hsProductMappings.slice(0, 5).map((mapping: any, idx: number) => (
                              <div key={idx} className="text-slate-600 dark:text-slate-400">
                                {mapping.productCodeRelation.productCode}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Codes Tab */}
      {results.productCodes && results.productCodes.length > 0 && (activeTab === 'product' || hsCount === 0) && (
        <div>
          {hsCount === 0 && (
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Product Codes ({results.productCodes.length})
            </h3>
          )}
          <div className="space-y-3">
            {results.productCodes.map((productCode: any) => (
              <div
                key={productCode.productCode}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-mono font-bold text-green-600 dark:text-green-400">
                        {productCode.productCode}
                      </span>
                      {productCode.category && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {productCode.category}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-2">{productCode.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(() => {
                        const validControls = productCode.productCaControls?.filter((control: any) => 
                          control.caRelation.caCode !== '-' && control.caRelation.caCode.trim() !== ''
                        ) || [];
                        
                        return validControls.length > 0 ? (
                          validControls.map((control: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                            >
                              {control.caRelation.caCode}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            UNCONTROLLED
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(`pc-${productCode.productCode}`)}
                    className="ml-4 px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                  >
                    {expandedItems.has(`pc-${productCode.productCode}`) ? 'Hide' : 'Details'}
                  </button>
                </div>

                {expandedItems.has(`pc-${productCode.productCode}`) && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {productCode.hsProductMappings && productCode.hsProductMappings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                          Related HS Codes ({productCode.hsProductMappings.length})
                        </h4>
                        <div className="space-y-1">
                          {productCode.hsProductMappings.slice(0, 5).map((mapping: any, idx: number) => (
                            <div key={idx} className="text-slate-600 dark:text-slate-400">
                              {mapping.hsCodeRelation.hsCode} - {mapping.hsCodeRelation.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.total === 0 && (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
          No results found. Try adjusting your search criteria.
        </div>
      )}

      {/* Infinite scroll trigger - only render when there are more results */}
      {hasMore && (
        <>
          <div ref={observerTarget} className="h-4" />
          <div className="flex justify-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </>
      )}
    </div>
  );
}
