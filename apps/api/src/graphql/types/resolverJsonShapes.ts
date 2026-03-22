import type { Scalars } from "./types.js";

/** Wie im GraphQL-Schema / API-Codegen (`Scalars["JSON"]`). */
export type GraphJson = Scalars["JSON"]["output"];

/** Relevante Felder aus `{lang}.json` für Data-Resolver (Pfade zu Listen). */
export type LangJsonConfig = {
	dataTypes: Record<string, { filePath: string; title?: string }>;
};

/** Eintrag in einer dynamischen Daten-JSON-Liste. */
export type DataListRow = {
	id: string;
	createdAt?: string;
	updatedAt?: string;
	isArchive?: boolean;
} & Record<string, GraphJson | undefined>;

/** Kontakt-Eintrag in `management/contacts/*.json`. */
export type ContactCardJson = {
	id: string;
	name: string;
	phone: string;
	email?: string;
	address?: string;
	birthday?: string;
	createdAt?: string;
	updatedAt?: string;
	isArchive?: boolean;
};

export type DashyLinkItemJson = {
	name: string;
	url: string;
	icon?: string;
	iconUrl?: string;
	isArchive?: boolean;
	updatedAt?: string;
};

export type DashySectionJson = {
	id: string;
	title: string;
	icon: string;
	items: DashyLinkItemJson[];
};

export type DashyWidgetJson = {
	id: string;
	title: string;
	icon: string;
	type: string;
	gridColumns: number;
	data: Record<string, GraphJson>;
};

/** Vollständiges `dashy.json` für Lesen/Schreiben. */
export type DashyDocumentJson = {
	title: string;
	user: {
		name: string;
		greeting: string;
	};
	header: {
		searchPlaceholder: string;
		design: {
			current: string;
			options: string[];
		};
		layout: string[];
		itemSize: string[];
	};
	footer: {
		text: string;
	};
	widgets: DashyWidgetJson[];
	sections: DashySectionJson[];
};
