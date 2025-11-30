import { create } from 'zustand';

export const useGlobalLoadingStore = create<GlobalLoadingState>((set) => ({
	isLoading: false,
	loadingMessage: '',

	setLoading: (loading: boolean, message: string = '') => {
		set({ isLoading: loading, loadingMessage: message });
	},

	setLoadingMessage: (message: string) => {
		set({ loadingMessage: message });
	},
}));
