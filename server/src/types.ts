export type ForceNode = {
  id: string;
  parentId: string | null;
  name: string | null;
  forceType: string | null;
  hasChildren: boolean;
};

export type ForcePathItem = {
  id: string;
  name: string | null;
  forceType: string | null;
};

export type ForceSearchResult = {
  id: string;
  name: string | null;
  forceType: string | null;
  path: ForcePathItem[];
};
