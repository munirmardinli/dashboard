import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const schemesDir = dirname(fileURLToPath(import.meta.url));

const schemas = await loadSchema(join(schemesDir, "*.graphql"), {
	loaders: [new GraphQLFileLoader()],
});

export { schemas };
