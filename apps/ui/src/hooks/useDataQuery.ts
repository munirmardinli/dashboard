import { useState, useEffect, useTransition, useRef, useMemo } from "react";
import { useQuery } from "@apollo/client";
import type { BaseItem } from "@/types/items";
import { GET_DASHY, GET_DATAS } from "@/utils/queries";

export function useDataQuery<T extends BaseItem>(
	dataType: string,
	params: QueryParams,
	options: { enabled?: boolean; debounceMs?: number } = {}
): QueryResult<T> {
	const { enabled = true, debounceMs = 0 } = options;
	const { page, limit, search, sortField, sortOrder } = params;

	const [debouncedSearch, setDebouncedSearch] = useState(search);
	const [, startTransition] = useTransition();
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		if (debounceMs > 0 && search !== undefined) {
			timerRef.current = setTimeout(() => {
				startTransition(() => setDebouncedSearch(search));
			}, debounceMs);
		} else {
			setDebouncedSearch(search);
		}
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [search, debounceMs]);

	const isDashy = dataType === "dashy";

	const listVariables = useMemo(
		() => ({
			dataType,
			pagination: { page, limit },
			search: debouncedSearch ? debouncedSearch : null,
			sort: sortField
				? {
						field: sortField,
						order: (sortOrder === "desc" ? "desc" : "asc") as "asc" | "desc",
					}
				: null,
		}),
		[dataType, page, limit, debouncedSearch, sortField, sortOrder]
	);

	const {
		data: dashyResult,
		loading: dashyLoading,
		error: dashyError,
		refetch: refetchDashy,
	} = useQuery(GET_DASHY, {
		skip: !enabled || !isDashy,
	});

	const {
		data: listResult,
		loading: listLoading,
		error: listError,
		refetch: refetchList,
	} = useQuery(GET_DATAS, {
		skip: !enabled || isDashy,
		variables: listVariables,
	});

	const derived = useMemo(() => {
		if (isDashy) {
			const raw = dashyResult?.dashy as DashyData | undefined;
			if (!raw) {
				return { items: [] as T[], total: 0, totalPages: 0 };
			}
			const all: DashyItemWithMeta[] = [];
			raw.sections.forEach((section) => {
				section.items.forEach((item, index) => {
					all.push({
						...item,
						id: `${section.id}-${index}`,
						sectionId: section.id,
						sectionTitle: section.title,
						itemIndex: index,
						createdAt: new Date().toISOString(),
						updatedAt: item.updatedAt || new Date().toISOString(),
						isArchive: item.isArchive || false,
					});
				});
			});
			let filtered = all.filter((i) => !i.isArchive) as unknown as T[];
			if (debouncedSearch) {
				const term = debouncedSearch.toLowerCase();
				filtered = filtered.filter((item) =>
					Object.values(item as Record<string, unknown>).some((val) =>
						String(val).toLowerCase().includes(term)
					)
				);
			}
			if (sortField) {
				filtered.sort((a, b) => {
					const valA = (a as Record<string, unknown>)[sortField];
					const valB = (b as Record<string, unknown>)[sortField];
					if (valA === valB) return 0;
					const comp = String(valA).localeCompare(String(valB), undefined, {
						numeric: true,
						sensitivity: "base",
					});
					return sortOrder === "desc" ? -comp : comp;
				});
			}
			const total = filtered.length;
			const totalPages = Math.ceil(total / limit) || 0;
			const slice = filtered.slice((page - 1) * limit, page * limit);
			return { items: slice, total, totalPages };
		}

		const conn = listResult?.datas;
		if (!conn || conn.unavailableReason) {
			return { items: [] as T[], total: 0, totalPages: 0 };
		}
		return {
			items: conn.items as unknown as T[],
			total: conn.total,
			totalPages: conn.totalPages,
		};
	}, [
		isDashy,
		dashyResult,
		listResult,
		page,
		limit,
		debouncedSearch,
		sortField,
		sortOrder,
	]);

	const loading = isDashy ? dashyLoading : listLoading;
	const error = isDashy ? dashyError : listError;

	const refetch = async () => {
		if (isDashy) await refetchDashy();
		else await refetchList();
	};

	return {
		items: derived.items,
		total: derived.total,
		totalPages: derived.totalPages,
		loading,
		error: error ? "load-failed" : null,
		refetch,
	};
}
