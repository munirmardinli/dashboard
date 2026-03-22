import express from "express";
import cors from "cors";
import path from "path";
import router from "./routers/index.js";
import { ReminderChecker } from "./utils/reminderChecker.js";
import "dotenv/config";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { schemas } from "./graphql/schemes/schemes.js";
import { resolvers } from "./graphql/resolvers/resolvers.js";
import { scalars } from "./graphql/scalars/scalars.js";
import { mergeResolvers } from "@graphql-tools/merge";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import type { Resolvers } from "./graphql/types/types.js";

const PORT = process.env.PORT || "4012";

const reminderChecker = new ReminderChecker();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use("/", router);

const server = new ApolloServer<object>({
	typeDefs: schemas,
	resolvers: mergeResolvers([resolvers, scalars]) as Resolvers,
});

await server.start();

app.use(
	"/graphql",
	graphqlUploadExpress({ maxFileSize: 50_000_000, maxFiles: 10 }),
	expressMiddleware(server, {
		context: async () => ({}),
	})
);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	const message = err instanceof Error ? err.message : String(err);
	res.status(500).json({ error: message, statusCode: 500 });
});

app.listen(Number(PORT), () => {
	console.log(`🚀 Server on ${PORT}`);
	console.log(`   GraphQL http://localhost:${PORT}/graphql`);
	try {
		reminderChecker.start();
	} catch (err) {
		console.error("❌ Failed to start reminder scheduler:", err);
	}
});
