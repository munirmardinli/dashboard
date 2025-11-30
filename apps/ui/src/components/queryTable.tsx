import { FC, useState, useEffect, useRef, useMemo, useCallback, useTransition } from "react";
import { notFound, useRouter } from "next/navigation";
import { Clock, Plus, Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";

import { DataAPI, ConfigAPI } from "@/utils/api";
import { useSnackStore } from "@/stores/snackbarStore";
import { useGlobalLoadingStore } from "@/stores/globalLoadingStore";
import { useI18nStore } from "@/stores/i18nStore";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from '@/utils/theme';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export const TodoTable: FC<TodoTableProps> = ({ dataType, displayFields = [] }) => {
  const router = useRouter();
  const [allItems, setAllItems] = useState<GenericJsonItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [, setFullConfig] = useState<BasicConfig | null>(null);
  const [config, setConfig] = useState<DataTypeConfig | null>(null);
  const setSnack = useSnackStore((state) => state.setSnack);
  const { isLoading } = useGlobalLoadingStore();
  const { t, translations, loadTranslations, language, isRTL, getLocale, formatDate, formatDateTime } = useI18nStore();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);
  const isDesktop = useIsDesktop();

  const [isClient, setIsClient] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchError, setSearchError] = useState("");
  const [isPending, startTransition] = useTransition();

  const configCacheRef = useRef<{ config: BasicConfig | null; dataTypeConfig: Map<string, DataTypeConfig>; items: Map<string, GenericJsonItem[]> }>({
    config: null, dataTypeConfig: new Map(), items: new Map()
  });

  const actualDisplayFields = useMemo(() => (config?.view || displayFields).filter(f => !f.hidden), [config?.view, displayFields]);

  useEffect(() => { if (Object.keys(translations).length === 0) loadTranslations(language); }, [translations, language, loadTranslations]);
  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    startTransition(async () => {
      try {
        if (!configCacheRef.current.config) configCacheRef.current.config = await ConfigAPI.getFullConfig();
        if (!configCacheRef.current.dataTypeConfig.has(dataType)) {
          const dt = await ConfigAPI.getDataTypeConfig(dataType);
          if (dt) configCacheRef.current.dataTypeConfig.set(dataType, dt);
        }
        const cfg = configCacheRef.current.config;
        const dt = configCacheRef.current.dataTypeConfig.get(dataType);
        setFullConfig(cfg); setConfig(dt || null);
        if (dt?.defaultSortField) setSortField(dt.defaultSortField as SortField);
        if (dt?.defaultSortOrder) setSortOrder(dt.defaultSortOrder as 'asc' | 'desc');
      } catch { setError('config-load-failed'); }
    });
  }, [dataType]);

  useEffect(() => {
    startTransition(async () => {
      try {
        if (!configCacheRef.current.items.has(dataType)) configCacheRef.current.items.set(dataType, await DataAPI.getItems<GenericJsonItem>(dataType));
        setAllItems((configCacheRef.current.items.get(dataType) || []).filter(i => !i.isArchive));
      } catch { setError('load-failed'); setSnack(`${t("ui.failedToLoad")} ${dataType}`, 'error'); notFound(); }
    });
  }, [dataType, setSnack, t]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') { e.preventDefault(); searchInputRef.current?.focus(); searchInputRef.current?.select(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSort = useCallback((field: string, currentFilteredItems: GenericJsonItem[]) => {
    startTransition(() => {
      const currentSortField = currentFilteredItems.length > 0 ? Object.keys(currentFilteredItems[0] || {}).find(key => key === field) : field;
      if (currentSortField === field) {
        const newOrder = currentFilteredItems.length > 0 ? "desc" : "asc";
        setSortOrder(newOrder); setSnack(`${t("ui.sortedBy")} ${field} (${newOrder})`, 'info');
      } else {
        setSortField(field as SortField); setSortOrder("asc"); setSnack(`${t("ui.sortedBy")} ${field}`, 'info');
      }
    });
  }, [t, setSnack]);

  const searchInValue = useCallback((value: unknown, term: string): boolean => {
    if (value == null) return false;
    if (Array.isArray(value)) return value.some(item => searchInValue(item, term));
    if (typeof value === 'object') return Object.values(value).some(v => searchInValue(v, term));
    return String(value).toLowerCase().includes(term.toLowerCase());
  }, []);

  const getFieldValue = useCallback((item: GenericJsonItem, fieldPath: string): unknown => {
    let value: unknown = item;
    for (const part of fieldPath.split('.')) {
      if (value == null || typeof value !== 'object') return null;
      value = (value as Record<string, unknown>)[part];
    }
    return value;
  }, []);

  const filteredItems = useMemo(() => {
    let items = [...allItems];
    if (searchTerm) {
      const searchFields = config?.searchFields?.length ? config.searchFields : (allItems.length ? Object.keys(allItems[0]).filter(k => !['id', 'createdAt', 'updatedAt', 'isArchive'].includes(k)) : ['title', 'description', 'category']);
      items = items.filter(item => searchFields.some(field => searchInValue(getFieldValue(item, field), searchTerm)));
    }
    items.sort((a: any, b: any) => {
      const aVal = a[sortField], bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal == null) return sortOrder === 'asc' ? -1 : 1;
      if (bVal == null) return sortOrder === 'asc' ? 1 : -1;
      const comp = String(aVal).toLowerCase() < String(bVal).toLowerCase() ? -1 : 1;
      return sortOrder === 'asc' ? comp : -comp;
    });
    return items;
  }, [allItems, searchTerm, sortField, sortOrder, config?.searchFields, getFieldValue, searchInValue]);

  const paginatedItems = useMemo(() => filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredItems, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredItems.length);

  const formatNum = (num: number) => num.toLocaleString(getLocale()).replace(/_/g, '-');
  const handleEdit = (id: string) => startTransition(() => router.push(`/q?view=${dataType}&id=${id}`));

  const getViewFieldLabel = useCallback((fieldKey: string) => {
    const field = (translations.dataTypes?.[dataType]?.view as DisplayField[])?.find(f => f.key === fieldKey);
    return field?.label || '';
  }, [dataType, translations.dataTypes]);

  const getReminderLabel = useCallback((reminder: string) => {
    const options = (translations.dataTypes?.[dataType]?.create as FormField[])?.find(f => f.key === 'reminder')?.options || config?.create.find(f => f.key === 'reminder')?.options;
    return options?.find(o => o.value === reminder)?.label || reminder;
  }, [config, dataType, translations.dataTypes]);

  const isOverdue = (dueDate: string, isArchive: boolean) => dueDate && new Date(dueDate) < new Date() && !isArchive;

  const renderCellContent = (item: DataItem, field: DisplayField) => {
    const value = (item as any)[field.key];
    if (!value) return null;
    if (field.type === 'date') return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: isDesktop ? '0.9rem' : '0.8rem',
        background: isOverdue(String(value), item.isArchive) ? '#fee2e2' : '#f3f4f6', color: isOverdue(String(value), item.isArchive) ? '#991b1b' : '#374151',
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
    if (field.type === 'chip') return <span style={{ padding: '6px 12px', borderRadius: '20px', background: '#e5e7eb', fontSize: isDesktop ? '0.9rem' : '0.8rem', color: '#374151' }}>{String(value)}</span>;
    return <span style={{ fontSize: isDesktop ? '1rem' : '0.875rem', color: theme.text }}>{String(value)}</span>;
  };

  if (error) return notFound();
  if (!isClient || isLoading || isPending) return null;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div style={{
        borderRadius: isDesktop ? '12px' : '8px', overflow: 'hidden', background: theme.bg,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${theme.divider}`
      }}>
        <div style={{ padding: isDesktop ? '24px' : '16px 12px', borderBottom: `1px solid ${theme.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: isDesktop ? '20px' : '12px', flexWrap: 'wrap', background: theme.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', background: theme.paper, borderRadius: isDesktop ? '8px' : '6px', padding: isDesktop ? '12px 16px' : '10px 12px', border: `1px solid ${searchError ? '#ef4444' : theme.divider}`, width: isDesktop ? '300px' : '100%', maxWidth: '300px', boxShadow: 'none' }}>
            <Search size={isDesktop ? 22 : 18} color={theme.textSec} />
            <input
              ref={searchInputRef} type="search" placeholder={t("ui.searchPlaceholder")} value={searchTerm}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== '' && !/^[a-zA-ZäöüÄÖÜß\u0600-\u06FF\s\-\,!?()\[\]{}\"':;]*$/.test(val)) { setSearchError(t("ui.onlyLatinGermanArabicCharacters")); setSnack(t("ui.onlyLatinGermanArabicCharacters"), 'warning'); }
                else { setSearchError(""); setSearchTerm(val); setCurrentPage(1); }
              }}
              style={{ border: 'none', background: 'transparent', marginLeft: isDesktop ? '12px' : '8px', flex: 1, outline: 'none', color: theme.text, fontSize: isDesktop ? '1rem' : '0.875rem' }}
            />
            {isDesktop && <span style={{ fontSize: '0.8rem', color: theme.textSec, border: `1px solid ${theme.divider}`, borderRadius: '4px', padding: '4px 8px', background: theme.bg }}>⌘J</span>}
          </div>
          <button
            onClick={() => startTransition(() => router.push(`/q?view=${dataType}&create=true`))}
            title={t("ui.tooltipAddNewItem")}
            style={{
              display: 'flex', alignItems: 'center', gap: isDesktop ? '10px' : '6px', padding: isDesktop ? '12px 28px' : '10px 20px', borderRadius: isDesktop ? '8px' : '6px', border: 'none',
              background: theme.primary, color: '#fff', fontWeight: 600, cursor: 'pointer',
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
                    onClick={() => handleSort(field.key, filteredItems)}
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
              {paginatedItems.map((item, index) => (
                <tr
                  key={item.id}
                  onClick={() => handleEdit(item.id)}
                  style={{
                    cursor: 'pointer', borderBottom: `1px solid ${theme.divider}`, transition: 'all 0.2s',
                    opacity: item.isArchive ? 0.6 : 1, background: theme.bg
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primary}08`; e.currentTarget.style.transform = 'scale(1.001)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.transform = 'none'; }}
                >
                  {actualDisplayFields.map((field) => (
                    <td key={field.key} style={{ padding: '20px 24px', color: theme.text, fontSize: '1rem' }}>
                      {field.key === 'title' ? (
                        <span style={{ textDecoration: item.isArchive ? "line-through" : "none", fontWeight: 600, fontSize: '1.1rem', color: theme.text }}>
                          {String((item as any)[field.key] || '')}
                        </span>
                      ) : renderCellContent(item, field)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '20px 24px', borderTop: `1px solid ${theme.divider}`, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', background: theme.bg }}>
          <button
            onClick={() => startTransition(() => setCurrentPage(Math.max(1, currentPage - 1)))}
            disabled={currentPage === 1}
            title={t("ui.tooltipPrevPage")}
            style={{
              background: currentPage === 1 ? 'transparent' : `${theme.primary}10`,
              border: 'none', borderRadius: '12px', padding: '8px',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              color: currentPage === 1 ? theme.textSec : theme.primary,
              transition: 'all 0.2s'
            }}
          >
            {isRTL() ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
          <span style={{ fontSize: '1rem', color: theme.text, fontWeight: 500 }}>
            {formatNum(startItem)}-{formatNum(endItem)} {isClient ? t("ui.paginationFrom") : ""} {formatNum(filteredItems.length)}
          </span>
          <button
            onClick={() => startTransition(() => setCurrentPage(Math.min(totalPages, currentPage + 1)))}
            disabled={currentPage >= totalPages}
            title={t("ui.tooltipNextPage")}
            style={{
              background: currentPage >= totalPages ? 'transparent' : `${theme.primary}10`,
              border: 'none', borderRadius: '12px', padding: '8px',
              cursor: currentPage >= totalPages ? 'default' : 'pointer',
              color: currentPage >= totalPages ? theme.textSec : theme.primary,
              transition: 'all 0.2s'
            }}
          >
            {isRTL() ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};
