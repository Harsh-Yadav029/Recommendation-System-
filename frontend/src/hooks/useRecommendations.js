import { useState, useEffect } from "react";

export function useRecommendations(domain, filters, csrfToken) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRelaxed, setIsRelaxed] = useState(false);
  const [relaxedConstraint, setRelaxedConstraint] = useState(null);

  useEffect(() => {
    if (!domain) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchRecommendations = async () => {
      try {
        const activeFilters = {};
        if (filters.budget_max) activeFilters.budget_max = parseFloat(filters.budget_max);
        if (filters.category) activeFilters.category = filters.category;
        if (filters.tags && filters.tags.length > 0) activeFilters.tags = filters.tags;

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
        
        if (isMounted) {
          setItems(data.items || []);
          setIsRelaxed(data.relaxed || false);
          setRelaxedConstraint(data.relaxed_constraint || null);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, [domain, filters]);

  return { items, loading, error, isRelaxed, relaxedConstraint };
}
