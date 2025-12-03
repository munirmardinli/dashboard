interface ReceiptAnalysisRequest {
	image: string; 
}

interface ExpenseItem {
	key: string;
	value: number;
}

interface ExpenseData {
	id: string;
	date: string;
	store: string;
	items: ExpenseItem[];
	isArchive: boolean;
}

interface ReceiptAnalysisResponse {
	success: boolean;
	data?: Omit<ExpenseData, "id" | "isArchive">;
	error?: string;
}
