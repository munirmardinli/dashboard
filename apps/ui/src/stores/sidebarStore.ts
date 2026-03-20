import { create } from "zustand";

import { cookieService } from "@/utils/cookieService";

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
		cookieService.set({ lastActivePath: formattedPath });
		set({ activePath: formattedPath });
	},
}));

export async function initializeSidebarFromJson(): Promise<void> {
	if (typeof window === "undefined") return;

	const data = await cookieService.get();
	const storedPath = formatPath(data.lastActivePath as string);
	const currentState = useSidebarStore.getState();

	if (storedPath && storedPath !== currentState.activePath) {
		useSidebarStore.setState({ activePath: storedPath });
	}
}
