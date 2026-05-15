import { useEffect, useState } from "react";
import { forcesApi } from "../api/forcesAPI";
import type { ForcePathItem, ForceSearchResult } from "../types";

type SearchBoxProps = {
  onNavigate: (path: ForcePathItem[]) => void;
};

function pathLabel(path: ForcePathItem[]): string {
  return path
    .map((item) => item.name?.trim() || `Force ${item.id}`)
    .join(" / ");
}

export function SearchBox({ onNavigate }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ForceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSearchChange(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
    }
  }

  useEffect(() => {
    const searchText = query.trim();

    if (searchText.length < 2) {
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      forcesApi
        .search(searchText, controller.signal)
        .then(setResults)
        .catch(() => {
          if (!controller.signal.aborted) {
            setError("Search failed");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <section className="search-panel">
      <input
        className="search-input"
        value={query}
        placeholder="Search by name or force type..."
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {loading && <div className="search-status">Searching...</div>}
      {error && <div className="search-error">{error}</div>}

      <div className="search-results">
        {results.map((result) => (
          <button
            key={result.id}
            className="search-result"
            onClick={() => onNavigate(result.path)}
          >
            <span className="result-title">
              {result.name?.trim() || `Force ${result.id}`}
            </span>

            {result.forceType && (
              <span className="result-type">{result.forceType}</span>
            )}

            <span className="result-path">{pathLabel(result.path)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
