"use client";
import { create } from "zustand";

const PATH_COOKIE = "lastActivePath";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

function getCookie(name: string): string | undefined {
	if (typeof window === "undefined") return undefined;
	const cookies = document.cookie.split(";");
	const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));
	if (!cookie) return undefined;
	const parts = cookie.split("=");
	return parts.slice(1).join("=").trim();
}

function setCookie(name: string, value: string): void {
	if (typeof window === "undefined") return;
	document.cookie = `${name}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

function formatPath(path: string | null | undefined): string | null {
	if (!path) return null;
	if (path.startsWith("/") || path.startsWith("?")) return path;
	return `/?q=${path}`;
}

export const useSidebarStore = create<SidebarState>((set) => ({
	isOpen: false,
	activePath: typeof window !== "undefined" ? formatPath(getCookie(PATH_COOKIE)) : null,
	setIsOpen: (value: boolean) => {
		set({ isOpen: value });
	},
	toggleSidebar: () => {
		set((state) => ({ isOpen: !state.isOpen }));
	},
	setActivePath: (path: string) => {
		const formattedPath = formatPath(path) || "/";
		setCookie(PATH_COOKIE, formattedPath);
		set({ activePath: formattedPath });
	},
}));

export function initializeSidebarFromCookie(): void {
	if (typeof window === "undefined") return;

	const storedPath = formatPath(getCookie(PATH_COOKIE));
	const currentState = useSidebarStore.getState();

	if (storedPath && storedPath !== currentState.activePath) {
		useSidebarStore.setState({ activePath: storedPath });
	}
}
