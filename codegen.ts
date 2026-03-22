import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "apps/api/src/graphql/schemes/*.graphql",
	documents: [
		"apps/ui/src/utils/**/*.{ts,tsx}",
		"apps/ui/src/app/**/*.{ts,tsx}",
		"apps/ui/src/components/**/*.{ts,tsx}",
	],
	generates: {
		"apps/ui/src/models/": {
			preset: "client",
			plugins: [],
			presetConfig: {
				gqlTagName: "gql",
			},
			config: {
				useTypeImports: true,
				enumsAsTypes: true,
				strictScalars: true,
				scalars: {
					JSON: {
						input: "../../../api/src/graphql/scalars/jsonScalar.js#JsonValue",
						output: "../../../api/src/graphql/scalars/jsonScalar.js#JsonValue",
					},
					CookieDocument: {
						input: "../../../api/src/graphql/scalars/jsonScalar.js#JsonValue",
						output: "../../../api/src/graphql/scalars/jsonScalar.js#JsonValue",
					},
					Date: {
						input: "string",
						output: "string",
					},
					DateTime: {
						input: "string",
						output: "string",
					},
					Upload: {
						input: "unknown",
						output: "unknown",
					},
				},
			},
		},
		"apps/api/src/graphql/types/types.ts": {
			plugins: ["typescript", "typescript-resolvers"],
			config: {
				useTypeImports: true,
				enumsAsTypes: true,
				strictScalars: true,
				scalars: {
					JSON: {
						input: "../scalars/jsonScalar.js#JsonValue",
						output: "../scalars/jsonScalar.js#JsonValue",
					},
					CookieDocument: {
						input: "../scalars/jsonScalar.js#JsonValue",
						output: "../scalars/jsonScalar.js#JsonValue",
					},
					Date: {
						input: "string",
						output: "string",
					},
					DateTime: {
						input: "string",
						output: "string",
					},
					Upload: {
						input: "unknown",
						output: "unknown",
					},
				},
			},
		},
	},
};

export default config;
