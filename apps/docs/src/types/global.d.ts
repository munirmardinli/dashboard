import { DayLayoutAlgorithm, Event } from 'react-big-calendar';
import { ApplicationJobStatusEnum, ApplicationJobStatusEnumType } from '../constants/applicationJobStatus';

declare global {
	// ===== BASIS-TYPEN =====
	type JsonData = Record<string, unknown>;
	type CalendarType = 'work' | 'hobbies' | 'calendar';
	type ApplicationJobStatus = 'pending' | 'responded' | 'rejected' | 'accepted';

	interface FetchProps {
		loading: boolean;
		error: string | null;
		currentPage: number;
		pageSize: number;
	}

	interface IDialog<T> {
		selected: T | null;
		modalOpen: boolean;
	}

	interface ApplicationsJobProps extends ComponentProps {
		statusFilter?: 'all' | ApplicationJobStatusEnumType;
	}

	interface ComponentProps {
		filename: string;
	}
	// ===== KALENDER-TYPEN =====
	interface CalendarEvent extends Event {
		title: string;
		start: Date;
		end: Date;
		label?: string;
		description?: string;
	}

	interface CalendarData extends JsonData {
		events: CalendarEvent[];
	}

	// ===== STORE-TYPEN =====
	interface FileStore {
		get: <T extends JsonData = JsonData>(filename: string) => Promise<T>;
	}

	// ===== KALENDER-PROPS =====
	interface BaseCalendarProps {
		locale: string;
		key: string;
		dayLayoutAlgorithm: DayLayoutAlgorithm;
		messages: object;
		title?: string;
		end?: Date;
		start?: Date;
		events: CalendarEvent[];
	}

	// Legacy Interface für Rückwärtskompatibilität
	interface RBCCalendarProps {
		props: BaseCalendarProps;
	}

	// Haupt-Interface für MyCalendar - unterstützt beide Modi
	interface MyCalendarProps extends ComponentProps {
		props?: BaseCalendarProps;
		locale?: string;
		key?: string;
		dayLayoutAlgorithm?: DayLayoutAlgorithm;
	}

	// ===== TODO-TYPEN =====
	interface TodoItem {
		id: number;
		title: string;
		description?: string;
		done: boolean;
		createdAt: string;
		dueDate?: string;
		priority?: 'low' | 'medium' | 'high';
	}

	interface TodoState extends FetchProps {
		todos: TodoItem[];
		dateFilter: 'all' | 'today' | 'week' | 'overdue';
	}

	interface TodoData extends JsonData {
		todos: TodoItem[];
	}

	// ===== APPLICATION JOB TYPES =====

	interface ApplicationJobTexts extends JsonData {
		close: string;
		description: string;
		status: string;
		timestamp: string;
		jobPosting: string;
		employerResponse: string;
		applied: string;
		responseReceived: string;
		noDescription: string;
		noApplications: string;
		applicationsFound: string;
		loadingApplications: string;
		error: string;
		allApplications: string;
		pending: string;
		responded: string;
		rejected: string;
		accepted: string;
		title: string;
	}

	interface ApplicationJob {
		id: number;
		title: string;
		link?: string;
		done: boolean;
		description?: string;
		label?: string;
		requestDate: string;
		responseDate?: string;
		responseText?: string;
		status: ApplicationJobStatus;
	}

	interface ApplicationJobState extends FetchProps {
		applicationJobs: ApplicationJob[];
		statusFilter: 'all' | ApplicationJobStatusEnumType;
		selectedJob: ApplicationJob | null;
		modalOpen: boolean;
		texts: ApplicationJobTexts | null;
	}

	interface ApplicationJobData extends JsonData {
		application: ApplicationJob[];
		texts: ApplicationJobTexts;
	}

	// ===== ANDERE KOMPONENTEN =====
	interface QuoteProps {
		children: React.ReactNode;
		author?: string;
		source?: string;
		sourceUrl?: string;
		variant?: 'default' | 'highlighted' | 'minimal';
	}
	interface PlotSegment {
		x: number[];
		y: number[];
		mode: 'lines' | 'markers' | 'lines+markers';
		name: string;
		line?: {
			dash?: 'solid' | 'dot' | 'dash' | 'longdash' | 'dashdot' | 'longdashdot';
			width?: number;
			color?: string;
		};
	}

	interface JumpPoint {
		x: number;
		yStart: number;
		yEnd: number;
		name: string;
		lineStyle?: {
			dash?: 'solid' | 'dot' | 'dash' | 'longdash' | 'dashdot' | 'longdashdot';
			width?: number;
			color?: string;
		};
	}

	interface PlotlyGraphProps {
		segments: PlotSegment[];
		jumpPoints?: JumpPoint[];
		title?: string;
		xAxis?: {
			title?: string;
			range?: [number, number];
		};
		yAxis?: {
			title?: string;
			range?: [number, number];
		};
		width?: string | number;
		height?: string | number;
		className?: string;
	}

	// Plotly Typen definieren
	interface Plotly {
		react(
			arg0: string,
			data: PlotlyData[],
			layout: Partial<PlotlyLayout>
		): unknown;
		newPlot: (divId: string, data: PlotlyData[], layout: PlotlyLayout) => void;
	}

	interface PlotlyData {
		x: number[];
		y: number[];
		mode: string;
		name: string;
		type: string;
		line?: {
			dash?: string;
			width?: number;
			color?: string;
		};
	}

	interface PlotlyLayout {
		title: string;
		xaxis: {
			title: string;
			range: [number, number];
		};
		yaxis: {
			title: string;
			range: [number, number];
		};
		width: string | number;
		height: string | number;
	}
	interface Window {
		Plotly: Plotly;
	}

	// ===== CV-TYPEN =====

	// Gemeinsames Interface für Adressdaten
	interface AddressData {
		zipCity?: string | null;
		address?: string | null;
	}

	interface User {
		image?: string | null;
		firstName?: string | null;
		lastName?: string | null;
		mail?: string | null;
	}

	interface Transmitter extends AddressData {
		phone?: string | null;
	}

	interface CompetenceItem {
		key1?: string | null;
		key2?: string | null;
	}

	interface Recipient extends AddressData {
		name?: string | null;
		gender?: string | null;
		companyName?: string | null;
		contactPerson?: boolean | null;
	}

	interface ApplicationLetter {
		salutation?: string | null;
		farewellFormula?: string | null;
		subject?: string | null;
		recipient?: Recipient | null;
	}

	interface CvType {
		contactCaption?: string | null;
		languagesCaption?: string | null;
		mediacompetenceCaption?: string | null;
		socialCompetenceCaption?: string | null;
		socialMediaCaption?: string | null;
		hobbiesCaption?: string | null;
		aboutMeCaption?: string | null;
		aboutMeText?: string | null;
		workExperienceCaption?: string | null;
		schoolEducationCaption?: string | null;
		practisCaption?: string | null;

		language?: CompetenceItem[] | null;
		mediaCompetence?: CompetenceItem[] | null;
		socialCompetence?: CompetenceItem[] | null;
		socialMedia?: CompetenceItem[] | null;
		hobbies?: CompetenceItem[] | null;
		workExperience?: CompetenceItem[] | null;
		schoolEducation?: CompetenceItem[] | null;
		practis?: CompetenceItem[] | null;
	}

	// Interface für Events (aus der JSON)
	interface EventItem {
		message?: string | null;
	}

	interface CoverSheet {
		suggestion?: string | null;
		attachmentCaption?: string | null;
		attachments?: Attachment[] | null;
		documents?: Document[] | null;
		required?: Required | null;
	}

	interface Attachment {
		name?: string | null;
	}

	interface Document {
		url?: string | null;
	}

	interface Required {
		applicationLetter?: boolean | null;
		cv?: boolean | null;
		attachments?: boolean | null;
		coverSheet?: boolean | null;
	}

	interface CvProps extends JsonData {
		user?: User | null;
		transmitter?: Transmitter | null;
		cv?: CvType | null;
		applicationLetter?: ApplicationLetter | null;
		events?: EventItem[] | null;
		message?: string | null;
		coverSheet?: CoverSheet | null;
	}

	// ===== EXPENSE-TYPEN =====
	interface ExpenseItem {
		key: string;
		value: number;
	}

	interface ExpenseData {
		id: number;
		date: string;
		items: ExpenseItem[];
		store?: string;
	}

	interface ExpenseState extends FetchProps {
		expenses: ExpenseData[];
		selectedExpense: ExpenseData | null;
		modalOpen: boolean;
	}

	interface ExpenseJsonData extends JsonData {
		expenses: ExpenseData[];
	}
}

export { };

declare module '*.png' {
	const value: string;
	export = value;
}
