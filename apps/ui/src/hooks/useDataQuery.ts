import { useState, useCallback, useEffect, useTransition, useRef } from 'react';
import { DataAPI, DashyAPI } from '@/utils/api';

export function useDataQuery<T extends BaseItem>(
  dataType: string,
  params: QueryParams,
  options: { enabled?: boolean; debounceMs?: number } = {}
): QueryResult<T> {

  const { enabled = true, debounceMs = 0 } = options;
  const { page, limit, search, sortField, sortOrder } = params;
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastParamsRef = useRef<string>("");

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    const paramsKey = JSON.stringify({ dataType, page, limit, search, sortField, sortOrder });
    if (paramsKey === lastParamsRef.current) return;
    lastParamsRef.current = paramsKey;

    setLoading(true);
    setError(null);

    try {
      if (dataType === 'dashy') {
        const allDashyItems = await DashyAPI.getAllItems();
        const nonArchived = allDashyItems.filter(i => !i.isArchive) as unknown as T[];
        
        let filtered = nonArchived;
        if (params.search) {
          const term = params.search.toLowerCase();
          filtered = nonArchived.filter(item => 
            Object.values(item as Record<string, unknown>).some(val => String(val).toLowerCase().includes(term))
          );
        }

        if (sortField) {
          filtered.sort((a, b) => {
            const valA = (a as any)[sortField];
            const valB = (b as any)[sortField];
            if (valA === valB) return 0;
            const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
            return sortOrder === 'desc' ? -comp : comp;
          });
        }
        
        setTotal(filtered.length);
        setTotalPages(Math.ceil(filtered.length / limit));
        setItems(filtered.slice((page - 1) * limit, page * limit));
      } else {
        const result = await DataAPI.getItems<T>(dataType, params);
        setItems(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    } catch (err) {
      setError('load-failed');
    } finally {
      setLoading(false);
    }
  }, [dataType, page, limit, search, sortField, sortOrder, enabled]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (debounceMs > 0 && params.search) {
      timerRef.current = setTimeout(() => {
        startTransition(() => {
          fetchData();
        });
      }, debounceMs);
    } else {
      startTransition(() => {
        fetchData();
      });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchData, debounceMs, search]);

  return {
    items,
    total,
    totalPages,
    loading: loading || isPending,
    error,
    refetch: fetchData
  };
}
