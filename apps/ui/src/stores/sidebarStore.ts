import { create } from "zustand";

async function getFromCookieJson() {
	if (typeof window === "undefined") return {};
	try {
		const res = await fetch(`${globalVars.API_URL}/api/cookie`);
		if (!res.ok) return {};
		return await res.json();
	} catch (e) {
		console.error("Failed to fetch cookie.json", e);
		return {};
	}
}

async function saveToCookieJson(data: Record<string, unknown>): Promise<void> {
	if (typeof window === "undefined") return;
	try {
		await fetch(`${globalVars.API_URL}/api/cookie`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
	} catch (e) {
		console.error("Failed to save to cookie.json", e);
	}
}

function formatPath(path: string | null | undefined): string | null {
	if (!path) return null;
	if (path.startsWith("/") || path.startsWith("?")) return path;
	return `/?q=${path}`;
}

export const useSidebarStore = create<SidebarState>((set) => ({
	isOpen: false,
	activePath: null,
	setIsOpen: (value: boolean) => {
		set({ isOpen: value });
	},
	toggleSidebar: () => {
		set((state) => ({ isOpen: !state.isOpen }));
	},
	setActivePath: (path: string) => {
		const formattedPath = formatPath(path) || "/";
		saveToCookieJson({ lastActivePath: formattedPath });
		set({ activePath: formattedPath });
	},
}));

export async function initializeSidebarFromJson(): Promise<void> {
	if (typeof window === "undefined") return;

	const data = await getFromCookieJson();
	const storedPath = formatPath(data.lastActivePath as string);
	const currentState = useSidebarStore.getState();

	if (storedPath && storedPath !== currentState.activePath) {
		useSidebarStore.setState({ activePath: storedPath });
	}
}
