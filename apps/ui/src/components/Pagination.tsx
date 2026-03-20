import { FC, useTransition } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useI18nStore } from '@/stores/i18nStore';
import { useThemeStore } from '@/stores/themeStore';
import { getTheme } from '@/utils/theme';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export const MuiPagination: FC<PaginationProps> = ({
  currentPage, totalPages, itemsPerPage, totalItems, onPageChange
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const { getLocale, t } = useI18nStore();
  const [, startTransition] = useTransition();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);
  const isDesktop = useIsDesktop();

  const formatNumber = (num: number) => num.toLocaleString(getLocale());

  const renderPageButton = (page: number) => (
    <button
      key={page}
      onClick={() => startTransition(() => onPageChange(page))}
      aria-current={page === currentPage ? 'page' : undefined}
      aria-label={`${t("ui.ariaPaginationItem")} ${page}`}
      style={{
        minWidth: isDesktop ? '40px' : '32px',
        height: isDesktop ? '40px' : '32px',
        borderRadius: isDesktop ? '8px' : '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: isDesktop ? '1rem' : '0.875rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: page === currentPage ? theme.primary : 'transparent',
        color: page === currentPage ? theme.white : theme.text,
        transition: 'all 0.2s',
        boxShadow: page === currentPage ? `0 2px 8px ${theme.primary}40` : 'none'
      }}
      onMouseEnter={(e) => { if (page !== currentPage) e.currentTarget.style.background = `${theme.primary}1a`; }}
      onMouseLeave={(e) => { if (page !== currentPage) e.currentTarget.style.background = 'transparent'; }}
    >
      {page}
    </button>
  );

  const maxVisiblePages = isDesktop ? 5 : 3;

  return (
    <div
      role="navigation" aria-label={t("ui.ariaPagination")}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: isDesktop ? '16px' : '8px',
        padding: isDesktop ? '20px 24px' : '16px 12px',
        background: theme.bg,
        borderTop: `1px solid ${theme.divider}`,
      }}
    >

      <span style={{
        color: theme.textSec,
        fontWeight: 600,
        padding: isDesktop ? '8px 16px' : '6px 12px',
        borderRadius: isDesktop ? '8px' : '6px',
        background: `${theme.paper}`,
        border: `1px solid ${theme.divider}`,
        fontSize: isDesktop ? '1rem' : '0.875rem'
      }}>
        {totalItems > 0 ? `${formatNumber(startItem)}-${formatNumber(endItem)} ${t("ui.paginationFrom") ?? ""} ${formatNumber(totalItems)}` : t("ui.paginatiNoItems") ?? ""}
      </span>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: isDesktop ? '8px' : '4px', alignItems: 'center' }}>
          <button
            onClick={() => startTransition(() => onPageChange(Math.max(1, currentPage - 1)))}
            disabled={currentPage === 1}
            aria-label={t("ui.ariaGoToPreviousPage")}
            style={{
              width: isDesktop ? '40px' : '32px',
              height: isDesktop ? '40px' : '32px',
              borderRadius: isDesktop ? '8px' : '6px',
              border: `1px solid ${theme.divider}`,
              background: theme.paper,
              color: theme.text,
              cursor: currentPage === 1 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            <ChevronLeft size={isDesktop ? 20 : 16} />
          </button>

          {(() => {
            const range = [];
            let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let end = Math.min(totalPages, start + maxVisiblePages - 1);

            if (end - start + 1 < maxVisiblePages) {
              start = Math.max(1, end - maxVisiblePages + 1);
            }

            for (let i = start; i <= end; i++) {
              range.push(renderPageButton(i));
            }
            return range;
          })()}


          <button
            onClick={() => startTransition(() => onPageChange(Math.min(totalPages, currentPage + 1)))}
            disabled={currentPage === totalPages}
            aria-label={t("ui.ariaGoToNextPage")}
            style={{
              width: isDesktop ? '40px' : '32px',
              height: isDesktop ? '40px' : '32px',
              borderRadius: isDesktop ? '8px' : '6px',
              border: `1px solid ${theme.divider}`,
              background: theme.paper,
              color: theme.text,
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            <ChevronRight size={isDesktop ? 20 : 16} />
          </button>
        </div>
      )}
    </div>
  );
};
