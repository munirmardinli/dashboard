import type { ApolloClient } from "@apollo/client";

type FieldModifierCtx = { args?: Record<string, unknown> | null; DELETE: unknown };

export function invalidateDashyCache(client: ApolloClient<object>): void {
	client.cache.modify({
		id: "ROOT_QUERY",
		fields: {
			dashy(_existing, { DELETE }: FieldModifierCtx) {
				return DELETE;
			},
		},
	});
	client.cache.gc();
}

export function invalidateDataTypeCache(
	client: ApolloClient<object>,
	dataType: string,
	opts?: { singleItemId?: string }
): void {
	const singleId = opts?.singleItemId;
	client.cache.modify({
		id: "ROOT_QUERY",
		fields: {
			datas(existing, { args, DELETE }: FieldModifierCtx) {
				const dt = args?.dataType as string | undefined;
				if (dt === dataType) return DELETE;
				return existing;
			},
			data(existing, { args, DELETE }: FieldModifierCtx) {
				if (!singleId) return existing;
				const a = args as { dataType?: string; id?: string } | null | undefined;
				if (a?.dataType === dataType && a?.id === singleId) return DELETE;
				return existing;
			},
		},
	});
	client.cache.gc();
}
