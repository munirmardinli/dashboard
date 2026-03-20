import { create } from 'zustand';
import { CookieUtils } from '@/utils/cookies';

export const usePaginationStore = create<PaginationState>((set, get) => ({
  pages: {},
  setPage: (dataType: string, page: number) => {
    set((state) => ({
      pages: { ...state.pages, [dataType]: page },
    }));
    CookieUtils.set(`pagination_${dataType}`, String(page), 7);
  },
  getPage: (dataType: string) => {
    const { pages } = get();
    if (pages[dataType]) return pages[dataType];
    const saved = CookieUtils.get(`pagination_${dataType}`);
    if (saved) {
      const pageNum = Number(saved);
      if (!isNaN(pageNum)) return pageNum;
    }
    return 1;
  },
}));
