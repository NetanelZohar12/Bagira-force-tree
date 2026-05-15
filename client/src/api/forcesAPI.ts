import type { ForceNode, ForceSearchResult } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function requestJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export const forcesApi = {
  getRoots(signal?: AbortSignal) {
    return requestJson<ForceNode[]>("/api/forces/roots", signal);
  },

  getChildren(parentId: string, signal?: AbortSignal) {
    return requestJson<ForceNode[]>(
      `/api/forces/${encodeURIComponent(parentId)}/children`,
      signal,
    );
  },

  search(query: string, signal?: AbortSignal) {
    const params = new URLSearchParams({
      q: query,
      limit: "25",
    });

    return requestJson<ForceSearchResult[]>(
      `/api/forces/search?${params.toString()}`,
      signal,
    );
  },
};
