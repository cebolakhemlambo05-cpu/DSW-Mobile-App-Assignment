import { useEffect, useState } from "react";
import { ATTRACTIONS as FALLBACK_ATTRACTIONS } from "../data/attractions";
import { fetchSouthAfricaAttractions } from "../services/placesService";

export function useAttractions(query = "") {
  const [attractions, setAttractions] = useState(FALLBACK_ATTRACTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [osmSearchActive, setOsmSearchActive] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setAttractions(FALLBACK_ATTRACTIONS);
      setLoading(false);
      setError(null);
      setOsmSearchActive(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setOsmSearchActive(false);
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchSouthAfricaAttractions({
        query: normalizedQuery,
        signal: controller.signal,
      })
        .then((searchResults) => {
          if (!active) return;
          setOsmSearchActive(true);
          const normalizeName = (name) =>
            String(name || "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, " ")
              .trim();
          const localNames = FALLBACK_ATTRACTIONS.map((attraction) =>
            normalizeName(attraction.name)
          );
          const externalResults = searchResults.filter((result) => {
            const resultName = normalizeName(result.name);
            return !localNames.some(
              (localName) =>
                localName &&
                (resultName.includes(localName) || localName.includes(resultName))
            );
          });
          setAttractions([...externalResults, ...FALLBACK_ATTRACTIONS]);
        })
        .catch((requestError) => {
          if (active && requestError?.name !== "AbortError") {
            setAttractions(FALLBACK_ATTRACTIONS);
            setError(requestError);
            setOsmSearchActive(false);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { attractions, loading, error, osmSearchActive };
}