import type { IncomingMessage, ServerResponse } from "node:http";

declare global {
	interface RouteContext {
		params: Record<string, string>;
		body: unknown;
		query: Record<string, string>;
	}

	type RouteHandler = (
		req: IncomingMessage,
		res: ServerResponse,
		ctx: RouteContext
	) => Promise<void>;

	interface Route {
		method: string;
		path: RegExp;
		handler: RouteHandler;
	}
}

export { };
