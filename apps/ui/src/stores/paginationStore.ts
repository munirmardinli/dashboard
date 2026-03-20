import { create } from 'zustand';

interface TableFilterState {
  page: number;
  search: string;
  sortField: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterStoreState {
  filters: Record<string, TableFilterState>;
  setFilter: (dataType: string, patch: Partial<TableFilterState>) => void;
  getFilter: (dataType: string) => TableFilterState;
}

const DEFAULTS: TableFilterState = { page: 1, search: '', sortField: 'title', sortOrder: 'asc' };

async function saveFilters(dataType: string, state: TableFilterState): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`${globalVars.API_URL}/api/cookie`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [`filter_${dataType}`]: state })
    });
  } catch (e) {
    console.error('Failed to persist filter state', e);
  }
}

export const useFilterStore = create<FilterStoreState>((set, get) => ({
  filters: {},
  setFilter: (dataType, patch) => {
    const prev = get().filters[dataType] || DEFAULTS;
    const next = { ...prev, ...patch };
    set((s) => ({ filters: { ...s.filters, [dataType]: next } }));
    saveFilters(dataType, next);
  },
  getFilter: (dataType) => get().filters[dataType] || DEFAULTS,
}));

export async function loadFilterFromJson(dataType: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch(`${globalVars.API_URL}/api/cookie`);
    if (!res.ok) return;
    const data = await res.json();
    const saved = data[`filter_${dataType}`] as TableFilterState | undefined;
    if (saved) {
      useFilterStore.setState((s) => ({
        filters: { ...s.filters, [dataType]: { ...DEFAULTS, ...saved } }
      }));
    }
  } catch (e) {
    console.error('Failed to load filter state from JSON', e);
  }
}

// Keep paginationStore as simple alias for backwards compat
export const usePaginationStore = create<PaginationState>((set, get) => ({
  pages: {},
  setPage: (dataType: string, page: number) => {
    set((state) => ({ pages: { ...state.pages, [dataType]: page } }));
    // Sync into filterStore too
    useFilterStore.getState().setFilter(dataType, { page });
  },
  getPage: (dataType: string) => {
    return get().pages[dataType] || 1;
  },
}));
