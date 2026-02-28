declare global {

	interface DataParams {
		dataType?: string;
		id?: string;
	}

	interface LanguageParams {
		language: string;
	}

	interface FilenameParams {
		filename?: string;
	}

	interface CalendarParams {
		calendarName?: string;
	}

	interface ImageParams {
		filepath?: string;
	}

	interface PosParams {
		0?: string;
	}

	interface DashyRouteParams { sectionId?: string; itemIndex?: string; }
	interface DataRouteParams { dataType?: string; id?: string; }
	interface LanguageRouteParams { language?: string; }
	interface DataTypeRouteParams { dataType?: string; }
	interface FilenameRouteParams { filename?: string; }
	interface CalendarRouteParams { calendarName?: string; }
	interface ImageRouteParams { filepath?: string; }
	interface DocsRouteParams { subPath?: string; }

	interface DocFolder {
		title: string;
		[key: string]: string | DocFolder;
	}

	type MetaData = Record<string, string | DocFolder>;
}

export { }
