import { create } from 'zustand';
import { cookieService } from '@/utils/cookieService';

export interface TableFilterState {
  page: number;
  search: string;
  sortField: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterStoreState {
  filters: Record<string, TableFilterState>;
  setFilter: (
    dataType: string,
    patch: Partial<TableFilterState>,
    options?: { persist?: boolean }
  ) => void;
  getFilter: (dataType: string) => TableFilterState;
}

const DEFAULTS: TableFilterState = { page: 1, search: '', sortField: 'title', sortOrder: 'asc' };

async function saveFilters(dataType: string, state: TableFilterState): Promise<void> {
  if (typeof window === 'undefined') return;
  cookieService.set({ [`filter_${dataType}`]: state });
}

function filtersEqual(a: TableFilterState, b: TableFilterState): boolean {
  return (
    a.page === b.page &&
    a.search === b.search &&
    a.sortField === b.sortField &&
    a.sortOrder === b.sortOrder
  );
}

export const useFilterStore = create<FilterStoreState>((set, get) => ({
  filters: {},
  setFilter: (dataType, patch, options?: { persist?: boolean }) => {
    const persist = options?.persist !== false;
    const prev = get().filters[dataType] || DEFAULTS;
    const next = { ...prev, ...patch };
    set((s) => ({ filters: { ...s.filters, [dataType]: next } }));
    if (!persist) return;
    if (filtersEqual(prev, next)) return;
    saveFilters(dataType, next);
  },
  getFilter: (dataType) => get().filters[dataType] || DEFAULTS,
}));

export async function loadFilterFromJson(dataType: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const data = await cookieService.get();
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

export const usePaginationStore = create<PaginationState>(() => ({
  setPage: (dataType: string, page: number) => {
    useFilterStore.getState().setFilter(dataType, { page }, { persist: false });
  },
  getPage: (dataType: string) => {
    return useFilterStore.getState().getFilter(dataType).page;
  },
}));
