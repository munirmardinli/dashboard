import { create } from 'zustand';

export const useSnackStore = create<SnackbarState>()((set) => ({
	snack: { message: '', severity: '', open: false },
	setSnack: (message, severity): void =>
		set(() => ({
			snack: { message: message, severity: severity, open: true },
		})),
	closeSnack: (): void =>
		set((state) => ({
			snack: {
				message: state.snack.message,
				severity: state.snack.severity,
				open: false,
			},
		})),
}));
