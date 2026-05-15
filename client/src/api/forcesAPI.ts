import type { ForceNode, ForceSearchResult } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson<T>(
  path: string,
  signal?: AbortSignal,
  retries = 1,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, { signal });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }

      lastError = error;

      if (attempt < retries) {
        await sleep(250 * (attempt + 1));
      }
    }
  }

  throw lastError;
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
