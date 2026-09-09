import { useState, useEffect, useCallback, useRef } from "react";
import { FALLBACK_DATA } from "./fallbackData";

export function useRecommendations(domain, filters, csrfToken, initialPageSize = 24) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRelaxed, setIsRelaxed] = useState(false);
  const [relaxedConstraint, setRelaxedConstraint] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [hasNextPage, setHasNextPage] = useState(true);

  const filtersString = JSON.stringify(filters);
  const isFetchingRef = useRef(false);

  // Load static fallback data for the given domain
  const loadFallback = useCallback((domainKey) => {
    const key = domainKey === 'bookcrossing' ? 'books' : domainKey === 'steam' ? 'steam' : 'anime';
    const staticItems = FALLBACK_DATA[key] || [];
    setItems(staticItems);
    setHasNextPage(false);
    setIsRelaxed(false);
    setRelaxedConstraint(null);
    setIsFallback(true);
    setError(null);
  }, []);

  const fetchPage = useCallback(async (targetPage = 1, currentSize = pageSize) => {
    if (!domain || !csrfToken) return;
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    setIsFallback(false);

    try {
      let parsedFilters = {};
      try {
        parsedFilters = JSON.parse(filtersString || "{}");
      } catch {
        parsedFilters = {};
      }

      const activeFilters = { ...parsedFilters };
      if (activeFilters.budget_max) activeFilters.budget_max = parseFloat(activeFilters.budget_max);
      
      Object.keys(activeFilters).forEach(key => {
        if (!activeFilters[key] || (Array.isArray(activeFilters[key]) && activeFilters[key].length === 0)) {
          delete activeFilters[key];
        }
      });
      
      const currentOffset = (targetPage - 1) * currentSize;
      activeFilters.limit = currentSize;
      activeFilters.offset = currentOffset;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      let response;
      try {
        response = await fetch(`/api/recommend/${domain}`, {
          method: 'POST',
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            user_profile: { user_id: "anonymous", history: [] },
            constraints: activeFilters
          })
        });
        clearTimeout(timeoutId);
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        // Network error or timeout — use fallback silently
        loadFallback(domain);
        return;
      }

      if (!response.ok) {
        // Rate limit or server error — use fallback silently
        if (response.status === 429 || response.status === 503 || response.status === 502 || response.status >= 500) {
          loadFallback(domain);
          return;
        }
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const newItems = data.items || [];
      
      setItems(newItems);
      setIsRelaxed(data.relaxed || false);
      setRelaxedConstraint(data.relaxed_constraint || null);
      setIsFallback(false);
      
      // If we got as many items as requested, there is likely a next page
      setHasNextPage(newItems.length >= currentSize);
      
    } catch (err) {
      // Any unexpected error — use fallback
      loadFallback(domain);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [domain, filtersString, csrfToken, pageSize, loadFallback]);

  // Reset to page 1 whenever domain or filters change
  useEffect(() => {
    setPage(1);
    fetchPage(1, pageSize);
  }, [domain, filtersString, csrfToken]);

  const goToPage = (newPage) => {
    if (newPage < 1 || loading) return;
    setPage(newPage);
    fetchPage(newPage, pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (!hasNextPage || loading) return;
    goToPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 1 || loading) return;
    goToPage(page - 1);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
    fetchPage(1, newSize);
  };

  return { 
    items, 
    loading, 
    error, 
    isFallback,
    isRelaxed, 
    relaxedConstraint, 
    page, 
    pageSize,
    hasNextPage,
    hasPrevPage: page > 1,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handlePageSizeChange,
    refresh: () => fetchPage(page, pageSize)
  };
}
