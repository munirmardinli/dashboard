declare global {
	interface DataTypeConfig {
		filePath: string;
		title?: string;
	}

	interface DashboardConfig {
		dataTypes: Record<string, DataTypeConfig>;
		navigation?: Record<string, unknown>;
		onboarding?: unknown[];
		translations?: Record<string, string>;
	}

	type GenericItem = {
		id: string;
		createdAt?: string;
		updatedAt?: string;
		isArchive?: boolean;
	};
	type TodoItem = GenericItem & {
		title?: string;
		start?: string;
		end?: string;
		reminder?: string;
		description?: string;
	};
}

export { };
