import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const actionTypes = {
	ADD_TOAST: "ADD_TOAST",
	UPDATE_TOAST: "UPDATE_TOAST",
	DISMISS_TOAST: "DISMISS_TOAST",
	REMOVE_TOAST: "REMOVE_TOAST",
} as const;

declare global {

	type JsonData = Record<string, unknown>;

	interface Project {
		id: string;
		title: string;
		description: string;
		technologies: string[];
		image: string | null;
		demoUrl: string;
		repoUrl: string;
	}

	interface TechnicalSkill {
		name: string;
		level: number;
	}

	interface SoftSkill {
		name: string;
		icon: string;
	}

	interface MediaCompetence {
		name: string;
		proficiency: number;
	}

	interface SocialCompetence {
		name: string;
		proficiency: number;
	}

	interface Experience {
		id: string;
		company: string;
		position: string;
		period: string;
		description: string;
		achievements: string[];
	}

	interface Contact {
		email: string;
		location: string;
		social: {
			linkedin: string;
			github: string;
			xing?: string;
			youtube?: string;
		};
		loading?: string;
	}

	interface Profile {
		name: string;
		firstName: string;
		lastName: string;
		title: string;
		bio: string;
		email: string;
		image: string;
	}

	interface Language {
		name: string;
		level: string;
		proficiency: number;
	}

	interface Hobby {
		icon: string;
		name: string;
	}

	interface Education {
		id: string;
		period: string;
		description: string;
	}

	interface AboutMe {
		caption: string;
		text: string;
	}

	interface Event {
		message: string;
	}

	type ActionType = typeof actionTypes;

	interface State {
		toasts: ToasterToast[];
	}

	type ToasterToast = ToastProps & {
		id: string;
		title?: React.ReactNode;
		description?: React.ReactNode;
		action?: ToastActionElement;
	};

	type Action =
		| {
			type: ActionType["ADD_TOAST"];
			toast: ToasterToast;
		}
		| {
			type: ActionType["UPDATE_TOAST"];
			toast: Partial<ToasterToast>;
		}
		| {
			type: ActionType["DISMISS_TOAST"];
			toastId?: ToasterToast["id"];
		}
		| {
			type: ActionType["REMOVE_TOAST"];
			toastId?: ToasterToast["id"];
		};

	type Toast = Omit<ToasterToast, "id">;

	interface FormState {
		message: string;
		success: boolean;
	}

	interface BlogPost {
		id: string;
		title: string;
		image: string;
		description: string;
		content: string;
		category: string;
		tags: string[];
		metadata: {
			author: {
				name: string;
				role: string;
				src: string;
			};
			readTime: string;
			date: string;
		};
	}

	interface FileStore {
		get: <T extends JsonData = JsonData>(filename: string) => Promise<T>;
	}

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

	interface FetchProps {
		loading: boolean;
		error: string | null;
		currentPage: number;
		pageSize: number;
	}

	interface PortfolioData {
		traits: string[];
		projects: Project[];
		skills: {
			technicalSkills: TechnicalSkill[];
			mediaCompetence: MediaCompetence[];
			socialCompetence: SocialCompetence[];
		};
		experiences: Experience[];
		contact: Contact;
		profile: Profile;
		languages: Language[];
		hobbies: Hobby[];
		education: Education[];
		internships: Education[];
		aboutMe: AboutMe;
		events: Event[];
		ui?: {
			loading?: string;
			hero?: {
				greeting?: string;
				downloadCV?: string;
				contactMe?: string;
				learnMore?: string;
			};
			navigation?: {
				about?: string;
				aboutHref?: string;
				projects?: string;
				projectsHref?: string;
				skills?: string;
				skillsHref?: string;
				experience?: string;
				experienceHref?: string;
				contact?: string;
				contactHref?: string;
				blog?: string;
				blogHref?: string;
				toggleMenu?: string;
			};
			contact?: {
				title?: string;
				subtitle?: string;
				contactInfo?: string;
				description?: string;
				form?: {
					name?: string;
					email?: string;
					message?: string;
					namePlaceholder?: string;
					emailPlaceholder?: string;
					messagePlaceholder?: string;
					send?: string;
					sending?: string;
				};
				messages?: {
					successTitle?: string;
					successMessage?: string;
					errorTitle?: string;
					errorSend?: string;
					errorGeneric?: string;
				};
				ariaLabels?: {
					linkedin?: string;
					github?: string;
					email?: string;
				};
			};
			projects?: {
				label?: string;
				title?: string;
				demo?: string;
			};
			education?: {
				label?: string;
				title?: string;
			};
			experience?: {
				label?: string;
				title?: string;
				achievements?: string;
			};
			skills?: {
				label?: string;
				title?: string;
				mediaCompetence?: string;
				socialCompetence?: string;
			};
			languages?: {
				label?: string;
				title?: string;
			};
			internships?: {
				label?: string;
				title?: string;
			};
			hobbies?: {
				label?: string;
				title?: string;
			};
			footer?: {
				rights?: string;
				created?: string;
			};
		};
	};
}

export { };
