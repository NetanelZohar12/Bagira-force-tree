import { useCallback, useEffect, useRef, useState } from "react";
import { forcesApi } from "./api/forcesAPI";
import { ForceTree } from "./components/ForceTree";
import { SearchBox } from "./components/SearchBox";
import type { ForceNode, ForcePathItem } from "./types";

const ROOT_KEY = "__root__";

export default function App() {
  const [childrenByParent, setChildrenByParent] = useState<
    Record<string, ForceNode[]>
  >({});
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const inflightRef = useRef<Map<string, Promise<void>>>(new Map());
  const loadedKeysRef = useRef<Set<string>>(new Set());

  const loadChildren = useCallback((parentId: string | null): Promise<void> => {
    const key = parentId ?? ROOT_KEY;

    if (loadedKeysRef.current.has(key)) {
      return Promise.resolve();
    }

    const existingRequest = inflightRef.current.get(key);
    if (existingRequest) {
      return existingRequest;
    }

    const request = (async () => {
      setLoadingKeys((current) => new Set(current).add(key));
      setError(null);

      try {
        const nodes =
          parentId === null
            ? await forcesApi.getRoots()
            : await forcesApi.getChildren(parentId);

        setChildrenByParent((current) => ({
          ...current,
          [key]: nodes,
        }));

        loadedKeysRef.current.add(key);
      } catch (error) {
        setError("Failed to load force data");
        throw error;
      } finally {
        setLoadingKeys((current) => {
          const next = new Set(current);
          next.delete(key);
          return next;
        });

        inflightRef.current.delete(key);
      }
    })();

    inflightRef.current.set(key, request);
    return request;
  }, []);

  useEffect(() => {
    void loadChildren(null).catch(() => undefined);
  }, [loadChildren]);

  const handleToggle = useCallback(
    (node: ForceNode) => {
      if (!node.hasChildren) {
        return;
      }

      const shouldLoad = !openIds.has(node.id);

      setOpenIds((current) => {
        const next = new Set(current);

        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }

        return next;
      });

      if (shouldLoad) {
        void loadChildren(node.id).catch(() => undefined);
      }
    },
    [loadChildren, openIds],
  );

  const handleNavigate = useCallback(
    async (path: ForcePathItem[]) => {
      if (path.length === 0) {
        return;
      }

      await loadChildren(null);

      for (const item of path.slice(0, -1)) {
        setOpenIds((current) => new Set(current).add(item.id));
        await loadChildren(item.id);
      }

      setSelectedId(path[path.length - 1].id);
    },
    [loadChildren],
  );

  return (
    <main className="app">
      <header className="app-header">
        <h1>Force Tree</h1>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <SearchBox onNavigate={(path) => void handleNavigate(path)} />
        </aside>

        <section className="tree-panel">
          {error && <div className="error-box">{error}</div>}

          {loadingKeys.has(ROOT_KEY) && (
            <div className="loading-root">Loading root forces...</div>
          )}

          <ForceTree
            nodes={childrenByParent[ROOT_KEY] ?? []}
            childrenByParent={childrenByParent}
            openIds={openIds}
            selectedId={selectedId}
            loadingKeys={loadingKeys}
            onToggle={handleToggle}
            onSelect={(node) => setSelectedId(node.id)}
          />
        </section>
      </div>
    </main>
  );
}
