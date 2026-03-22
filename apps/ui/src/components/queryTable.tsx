import { FC, useState, useEffect, useRef, useMemo, useCallback, useTransition } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Clock, Plus, Search, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

import { useSnackStore } from "@/stores/snackbarStore";
import { useGlobalLoadingStore } from "@/stores/globalLoadingStore";
import { useI18nStore } from "@/stores/i18nStore";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from '@/utils/theme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useTranslation } from "@/hooks/useTranslation";
import { TablePagination } from "./Pagination";
import { useDataQuery } from "@/hooks/useDataQuery";
import { usePaginationStore, useFilterStore, loadFilterFromJson } from "@/stores/paginationStore";
import type { DataItem, GenericJsonItem } from "@/types/items";

export const QueryTable: FC<QueriesTableProps> = ({ dataType, displayFields = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getPage = usePaginationStore((s) => s.getPage);
  const setPage = usePaginationStore((s) => s.setPage);
  const getFilter = useFilterStore((s) => s.getFilter);
  const setFilter = useFilterStore((s) => s.setFilter);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [, setFullConfig] = useState<BasicConfig | null>(null);
  const [config, setConfig] = useState<DataTypeConfig | null>(null);
  const setSnack = useSnackStore((state) => state.setSnack);
  const { isLoading } = useGlobalLoadingStore();
  const { t, translations, language, dataTypes } = useTranslation();
  const { formatDate, formatDateTime, loadTranslations } = useI18nStore();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);
  const isDesktop = useIsDesktop();

  const [isClient, setIsClient] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchError, setSearchError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const searchQueryRef = useRef<string>('');
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchPersistTimer = useRef<NodeJS.Timeout | null>(null);
  const [searchTrigger, setSearchTrigger] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);


  const actualDisplayFields = useMemo(() => (config?.view || displayFields).filter(f => !f.hidden), [config?.view, displayFields]);

  useEffect(() => {
    setIsInitializing(true);
    searchQueryRef.current = '';
    setSearchTrigger('');
    if (searchInputRef.current) searchInputRef.current.value = '';

    loadFilterFromJson(dataType).then(() => {
      const saved = getFilter(dataType);
      setCurrentPage(saved.page);
      
      searchQueryRef.current = saved.search || '';
      setSearchTrigger(saved.search || '');
      
      if (searchInputRef.current) {
        searchInputRef.current.value = saved.search || '';
      }
      
      setSortField(saved.sortField as SortField || 'title');
      setSortOrder(saved.sortOrder || 'asc');
      setIsInitializing(false);
    });
  }, [dataType]);

  useEffect(() => {
    const urlPage = searchParams?.get('page');
    let targetPage = 1;

    if (urlPage) {
      targetPage = Number(urlPage);
    } else {
      targetPage = getPage(dataType);
      if (targetPage > 1 && !isInitializing) {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.set('page', String(targetPage));
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
      }
    }

    if (!isNaN(targetPage) && targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }

    if (!isNaN(targetPage)) {
      setPage(dataType, targetPage);
    }
  }, [dataType, searchParams, getPage, setPage, currentPage, isInitializing, router]);

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set('page', String(page));
    setFilter(dataType, { page });
    startTransition(() => {
      router.push(`${window.location.pathname}?${params.toString()}`);
    });
  }, [router, searchParams, dataType, setFilter]);

  const { items, total: totalItems, totalPages, loading: queryLoading, error: queryError } = useDataQuery<GenericJsonItem>(
    dataType,
    { page: currentPage, limit: itemsPerPage, search: searchTrigger, sortField, sortOrder },
    { debounceMs: 50, enabled: !isInitializing }
  );

  useEffect(() => {
    if (queryError) {
      setSnack(`${t("ui.failedToLoad")} ${dataType}`, 'error');
    }
  }, [queryError, dataType, t, setSnack]);

  useEffect(() => { if (Object.keys(translations).length === 0) loadTranslations(language); }, [translations, language, loadTranslations]);
  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    startTransition(async () => {
      try {
        const dt = dataTypes[dataType] as DataTypeConfig | undefined;
        setFullConfig(translations as unknown as BasicConfig);
        setConfig(dt || null);
        if (dt?.defaultSortField) setSortField(dt.defaultSortField as SortField);
        if (dt?.defaultSortOrder) setSortOrder(dt.defaultSortOrder as 'asc' | 'desc');
      } catch { }
    });
  }, [dataType, dataTypes, translations]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') { e.preventDefault(); searchInputRef.current?.focus(); searchInputRef.current?.select(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSort = useCallback((field: string) => {
    startTransition(() => {
      const newOrder = sortField === field ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
      const newField = field as SortField;
      setSortField(newField);
      setSortOrder(newOrder);
      setFilter(dataType, { sortField: field, sortOrder: newOrder });
      setSnack(`${t("ui.sortedBy")} ${field}`, 'info');
    });
  }, [sortField, sortOrder, t, setSnack, dataType, setFilter]);


  const handleEdit = (id: string) => {
    if (dataType === 'dashy') {
      const item = items.find(i => i.id === id) as DashyItemWithMeta | undefined;
      if (item) {
        startTransition(() => router.push(`/?q=${dataType}&id=${id}&sectionId=${item.sectionId}&itemIndex=${item.itemIndex}`));
      }
    } else {
      startTransition(() => router.push(`/?q=${dataType}&id=${id}`));
    }
  };

  const getViewFieldLabel = useCallback((fieldKey: string) => {
    const field = (translations.dataTypes?.[dataType]?.view as DisplayField[])?.find(f => f.key === fieldKey);
    return field?.label || '';
  }, [dataType, translations.dataTypes]);

  const isOverdue = (dueDate: string, isArchive: boolean) => dueDate && new Date(dueDate) < new Date() && !isArchive;

  const renderCellContent = (item: DataItem, field: DisplayField) => {
    const value = (item)[field.key];
    if (!value) return null;
    if (field.type === 'date') return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: isDesktop ? '0.9rem' : '0.8rem',
        background: isOverdue(String(value), item.isArchive) ? theme.errorBg : theme.divider, color: isOverdue(String(value), item.isArchive) ? theme.error : theme.textSec,
        fontWeight: 500
      }}>
        <Clock size={14} /> {isClient ? formatDate(String(value)) : String(value)}
      </span>
    );
    if (field.type === 'datetime') { const dt = isClient ? formatDateTime(String(value)) : { date: String(value), time: '' }; return <span style={{ fontSize: isDesktop ? '1rem' : '0.875rem' }}>{dt.date}</span>; }
    if (field.type === 'number') return (
      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: isDesktop ? '0.9rem' : '0.8rem', fontWeight: 600, background: `${theme.primary}14`, border: `1px solid ${theme.primary}33`, color: theme.primary }}>
        {String(value)}
      </span>
    );
    if (field.type === 'chip') return <span style={{ padding: '6px 12px', borderRadius: '20px', background: theme.divider, fontSize: isDesktop ? '0.9rem' : '0.8rem', color: theme.textSec }}>{String(value)}</span>;
    if (field.type === 'url') {
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: theme.primary,
            textDecoration: 'none',
            fontSize: isDesktop ? '0.9rem' : '0.8rem',
          }}
        >
          {String(value)}
          <ExternalLink size={14} />
        </a>
      );
    }
    return <span style={{ fontSize: isDesktop ? '1rem' : '0.875rem', color: theme.text }}>{String(value)}</span>;
  };

  if (queryError) return notFound();
  if (!isClient || isLoading || isInitializing) return null;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div style={{
        borderRadius: isDesktop ? '12px' : '8px', overflow: 'hidden', background: theme.bg,
        boxShadow: theme.shadowXs, border: `1px solid ${theme.divider}`
      }}>
        <div style={{ padding: isDesktop ? '24px' : '16px 12px', borderBottom: `1px solid ${theme.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: isDesktop ? '20px' : '12px', flexWrap: 'wrap', background: theme.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', background: theme.paper, borderRadius: isDesktop ? '8px' : '6px', padding: isDesktop ? '12px 16px' : '10px 12px', border: `1px solid ${searchError ? theme.error : theme.divider}`, width: isDesktop ? '300px' : '100%', maxWidth: '300px', boxShadow: 'none' }}>
            <Search size={isDesktop ? 22 : 18} color={theme.textSec} />
            <input
              ref={searchInputRef}
              type="search"
              placeholder={t("ui.searchPlaceholder")}
              defaultValue={searchQueryRef.current}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== '' && !/^[a-zA-ZäöüÄÖÜß\u0600-\u06FF\s\-\,!?()\[\]{}\"':;]*$/.test(val)) {
                  setSearchError(t("ui.onlyLatinGermanArabicCharacters"));
                  setSnack(t("ui.onlyLatinGermanArabicCharacters"), 'warning');
                } else {
                  setSearchError("");
                  searchQueryRef.current = val;
                  setCurrentPage(1);
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  searchDebounceRef.current = setTimeout(() => setSearchTrigger(val), 300);
                  if (searchPersistTimer.current) clearTimeout(searchPersistTimer.current);
                  searchPersistTimer.current = setTimeout(() => setFilter(dataType, { search: val }), 1000);
                }
              }}
              style={{ border: 'none', background: 'transparent', marginLeft: isDesktop ? '12px' : '8px', flex: 1, outline: 'none', color: theme.text, fontSize: isDesktop ? '1rem' : '0.875rem' }}
            />
            {isDesktop && <span style={{ fontSize: '0.8rem', color: theme.textSec, border: `1px solid ${theme.divider}`, borderRadius: '4px', padding: '4px 8px', background: theme.bg }}>⌘J</span>}
          </div>
          <button
            onClick={() => startTransition(() => router.push(`/?q=${dataType}&create=true`))}
            title={t("ui.tooltipAddNewItem")}
            style={{
              display: 'flex', alignItems: 'center', gap: isDesktop ? '10px' : '6px', padding: isDesktop ? '12px 28px' : '10px 20px', borderRadius: isDesktop ? '8px' : '6px', border: 'none',
              background: theme.primary, color: theme.white, fontWeight: 600, cursor: 'pointer',
              boxShadow: `0 2px 8px ${theme.primary}30`, transition: 'all 0.2s', fontSize: isDesktop ? '1rem' : '0.875rem',
              flex: '0 0 auto'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${theme.primary}40`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 2px 8px ${theme.primary}30`; }}
          >
            <Plus size={isDesktop ? 20 : 18} /> {isClient ? t("ui.addButton") : ""}
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: `${theme.bg}` }}>
                {actualDisplayFields.map((field) => (
                  <th
                    key={field.key}
                    onClick={() => handleSort(field.key)}
                    style={{
                      padding: '20px 24px', textAlign: 'left', borderBottom: `2px solid ${theme.divider}`, cursor: 'pointer',
                      color: sortField === field.key ? theme.primary : theme.textSec, fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap',
                      transition: 'color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getViewFieldLabel(field.key) || field.label}
                      {sortField === field.key && (sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => handleEdit(item.id)}
                    style={{
                      cursor: 'pointer', borderBottom: `1px solid ${theme.divider}`, transition: 'all 0.2s',
                      background: theme.bg
                    }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primary}08`; e.currentTarget.style.transform = 'scale(1.001)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.transform = 'none'; }}
                >
                  {actualDisplayFields.map((field) => (
                    <td key={field.key} style={{ padding: '20px 24px', color: theme.text, fontSize: '1rem' }}>
                      {(field.key === 'title' || field.key === 'name') ? (
                        <span style={{ textDecoration: item.isArchive ? "line-through" : "none", fontWeight: 600, fontSize: '1.1rem', color: theme.text }}>
                          {String((item as Record<string, unknown>)[field.key] || '')}
                        </span>
                      ) : renderCellContent(item, field)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
