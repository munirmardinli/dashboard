import { create } from 'zustand';
import { DocsAPI } from '@/utils/api';

export const useDocsStore = create<DocsState>((set, get) => ({
	docs: [],
	isLoading: false,
	error: null,
	selectedDocId: null,
	fetchDocs: async () => {
		set({ isLoading: true, error: null });
		try {
			const docs = await DocsAPI.getAllDocs();
			set({ docs, isLoading: false });
		} catch (e) {
			set({ error: 'Failed to fetch docs', isLoading: false });
		}
	},
	createDoc: async (doc) => {
		set({ isLoading: true, error: null });
		try {
			const newDoc = await DocsAPI.createDoc(doc);
			if (newDoc) {
				set((state) => ({ docs: [...state.docs, newDoc], selectedDocId: newDoc.id, isLoading: false }));
			}
		} catch (e) {
			set({ error: 'Failed to create doc', isLoading: false });
		}
	},
	updateDoc: async (id, updates) => {
		try {
			const updatedDoc = await DocsAPI.updateDoc(id, updates);
			if (updatedDoc) {
				set((state) => ({
					docs: state.docs.map(d => d.id === id ? updatedDoc : d)
				}));
			}
		} catch (e) {
			set({ error: 'Failed to update doc' });
		}
	},
	archiveDoc: async (id) => {
		set({ isLoading: true });
		try {
			await DocsAPI.archiveDoc(id);
			set((state) => ({
				docs: state.docs.filter(d => d.id !== id),
				selectedDocId: state.selectedDocId === id ? null : state.selectedDocId,
				isLoading: false
			}));
		} catch (e) {
			set({ error: 'Failed to archive doc', isLoading: false });
		}
	},
	setSelectedDocId: (id) => set({ selectedDocId: id }),
}));
