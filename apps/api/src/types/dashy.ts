declare global {
	interface DashyItem {
		name: string;
		url: string;
		icon?: string;
		iconUrl?: string;
		isArchive?: boolean;
		updatedAt?: string;
	}

	interface DashySection {
		id: string;
		title: string;
		icon: string;
		items: DashyItem[];
	}

	interface DashyWidget {
		id: string;
		title: string;
		icon: string;
		type: string;
		gridColumns: number;
		data: Record<string, unknown>;
	}

	interface DashyData {
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
		widgets: DashyWidget[];
		sections: DashySection[];
	}
}

export { };
