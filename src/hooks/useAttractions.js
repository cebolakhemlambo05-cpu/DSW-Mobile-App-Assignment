import { useEffect, useState } from "react";
import { ATTRACTIONS as FALLBACK_ATTRACTIONS } from "../data/attractions";
import { fetchJson } from "../config/api";

export function useAttractions(query = "") {
  const [attractions, setAttractions] = useState(FALLBACK_ATTRACTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      const queryString = query.trim() ? `?query=${encodeURIComponent(query.trim())}` : "";
      fetchJson(`/api/attractions${queryString}`)
      .then(({ data }) => {
        if (active && Array.isArray(data)) setAttractions(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    }, query.trim() ? 400 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return { attractions, loading, error };
}