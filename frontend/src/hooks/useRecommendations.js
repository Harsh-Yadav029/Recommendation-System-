import { useState, useEffect, useCallback, useRef } from "react";

export function useRecommendations(domain, filters, csrfToken, initialPageSize = 24) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRelaxed, setIsRelaxed] = useState(false);
  const [relaxedConstraint, setRelaxedConstraint] = useState(null);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [hasNextPage, setHasNextPage] = useState(true);

  const filtersString = JSON.stringify(filters);
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(async (targetPage = 1, currentSize = pageSize) => {
    if (!domain || !csrfToken) return;
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

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

      const response = await fetch(`/api/recommend/${domain}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          user_profile: { user_id: "anonymous", history: [] },
          constraints: activeFilters
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment before retrying.");
        }
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const newItems = data.items || [];
      
      setItems(newItems);
      setIsRelaxed(data.relaxed || false);
      setRelaxedConstraint(data.relaxed_constraint || null);
      
      // If we got as many items as requested, there is likely a next page
      setHasNextPage(newItems.length >= currentSize);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [domain, filtersString, csrfToken, pageSize]);

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

