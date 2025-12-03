import { sendJSON, sendError } from "../utils/http.js";
import { DataService } from "../services/data.js";
import { generateUUID } from "../utils/uuid.js";

const dataService = new DataService();

export const dataRoutes: Route[] = [
	{
		method: "GET",
		path: /^\/api\/data\/(?<dataType>[^/]+)$/,
		handler: async (_req, res, ctx) => {
			try {
				const { dataType } = ctx.params;
				if (!dataType) {
					sendError(res, 400, "Data type parameter is required");
					return;
				}
				const items = await dataService.getItems(dataType);
				sendJSON(res, items);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get items");
			}
		},
	},
	{
		method: "POST",
		path: /^\/api\/data\/(?<dataType>[^/]+)$/,
		handler: async (_req, res, ctx) => {
			try {
				const { dataType } = ctx.params;
				if (!dataType) {
					sendError(res, 400, "Data type parameter is required");
					return;
				}
				const bodyData = ctx.body as Record<string, unknown>;
				if (!bodyData["id"]) {
					bodyData["id"] = generateUUID();
				}
				const newItem = await dataService.createItem(dataType, bodyData);
				if (newItem) {
					sendJSON(res, newItem, 201);
				} else {
					sendError(res, 400, "Failed to create item");
				}
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to create item");
			}
		},
	},
	{
		method: "PUT",
		path: /^\/api\/data\/(?<dataType>[^/]+)\/(?<id>[^/]+)$/,
		handler: async (_req, res, ctx) => {
			try {
				const { dataType, id } = ctx.params;
				if (!dataType || !id) {
					sendError(res, 400, "Data type and id parameters are required");
					return;
				}
				const updatedItem = await dataService.updateItem(dataType, id, ctx.body as Record<string, unknown>);
				if (updatedItem) {
					sendJSON(res, updatedItem);
				} else {
					sendError(res, 404, "Item not found");
				}
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to update item");
			}
		},
	},
	{
		method: "DELETE",
		path: /^\/api\/data\/(?<dataType>[^/]+)\/(?<id>[^/]+)$/,
		handler: async (_req, res, ctx) => {
			try {
				const { dataType, id } = ctx.params;
				if (!dataType || !id) {
					sendError(res, 400, "Data type and id parameters are required");
					return;
				}
				const success = await dataService.archiveItem(dataType, id);
				if (success) {
					sendJSON(res, { success: true, message: "Item archived successfully" });
				} else {
					sendError(res, 404, "Item not found");
				}
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to archive item");
			}
		},
	},
];
