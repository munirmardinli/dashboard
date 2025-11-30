declare global {
	/**
		* Base interface for all data items
		*/
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
