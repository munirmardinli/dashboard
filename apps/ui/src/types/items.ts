import type { JsonValue } from "@/types/jsonScalar";

/** Gemeinsame Felder für alle JSON-Datenzeilen (wie vom API-JSON-Scalar). */
export interface BaseItem {
	id: string;
	createdAt: string;
	updatedAt: string;
	isArchive: boolean;
}

/** Dynamisches Datenobjekt mit Codegen-`JsonValue` statt `unknown`. */
export interface GenericJsonItem extends BaseItem {
	[key: string]: JsonValue;
}

export type DataItem = GenericJsonItem;
