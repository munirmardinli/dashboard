declare global {
	interface Contact extends GenericItem {
		name: string;
		phone: string;
		email?: string;
		address?: string;
		birthday?: string
	}
}
export { };
