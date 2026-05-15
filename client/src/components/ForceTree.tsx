import type { ForceNode } from "../types";

type ForceTreeProps = {
  nodes: ForceNode[];
  childrenByParent: Record<string, ForceNode[]>;
  openIds: Set<string>;
  selectedId: string | null;
  loadingKeys: Set<string>;
  onToggle: (node: ForceNode) => void;
  onSelect: (node: ForceNode) => void;
};

function displayName(node: ForceNode): string {
  return node.name?.trim() || `Force ${node.id}`;
}

export function ForceTree({
  nodes,
  childrenByParent,
  openIds,
  selectedId,
  loadingKeys,
  onToggle,
  onSelect,
}: ForceTreeProps) {
  return (
    <ul className="tree-list">
      {nodes.map((node) => {
        const isOpen = openIds.has(node.id);
        const isSelected = selectedId === node.id;
        const children = childrenByParent[node.id] ?? [];
        const isLoading = loadingKeys.has(node.id);

        return (
          <li key={node.id}>
            <div
              className={`tree-row ${isSelected ? "selected" : ""}`}
              onClick={() => onSelect(node)}
            >
              <button
                className="expand-button"
                disabled={!node.hasChildren}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(node);
                }}
              >
                {node.hasChildren ? (isOpen ? "▾" : "▸") : "•"}
              </button>

              <div className="node-content">
                <span className="node-name">{displayName(node)}</span>
                {node.forceType && (
                  <span className="node-type">{node.forceType}</span>
                )}
              </div>
            </div>

            {isLoading && <div className="loading-row">Loading...</div>}

            {isOpen && children.length > 0 && (
              <ForceTree
                nodes={children}
                childrenByParent={childrenByParent}
                openIds={openIds}
                selectedId={selectedId}
                loadingKeys={loadingKeys}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
