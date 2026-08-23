import { useState, useEffect, useCallback } from "react";

export function useRecommendations(domain, filters, csrfToken) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRelaxed, setIsRelaxed] = useState(false);
  const [relaxedConstraint, setRelaxedConstraint] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 24;

  const fetchRecommendations = useCallback(async (currentOffset = 0) => {
    if (!domain) return;
    
    setLoading(true);
    if (currentOffset === 0) setError(null);

    try {
      const activeFilters = { ...filters };
      if (activeFilters.budget_max) activeFilters.budget_max = parseFloat(activeFilters.budget_max);
      
      Object.keys(activeFilters).forEach(key => {
        if (!activeFilters[key] || (Array.isArray(activeFilters[key]) && activeFilters[key].length === 0)) {
          delete activeFilters[key];
        }
      });
      
      activeFilters.limit = limit;
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
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const newItems = data.items || [];
      
      if (currentOffset === 0) {
        setItems(newItems);
        setIsRelaxed(data.relaxed || false);
        setRelaxedConstraint(data.relaxed_constraint || null);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
      
      // If we got fewer items than the limit, there are no more pages
      setHasMore(newItems.length >= limit);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [domain, filters, csrfToken, limit]);

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchRecommendations(0);
  }, [domain, filters, fetchRecommendations]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchRecommendations(nextOffset);
  };

  return { items, loading, error, isRelaxed, relaxedConstraint, loadMore, hasMore };
}
