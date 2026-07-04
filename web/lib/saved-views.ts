export type SavedViewFilters = {
  tab?: string | null;
  severity?: string | null;
  businessUnit?: string | null;
  scanSource?: string | null;
  query?: string | null;
  extra?: Record<string, unknown>;
};

export type SavedView = {
  id: string;
  name: string;
  persona?: string | null;
  filters: SavedViewFilters;
  createdAt: string;
  updatedAt: string;
};
