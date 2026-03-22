import { GraphQLScalarType, Kind, type ValueNode } from "graphql";
import { GraphQLError } from "graphql";

/** JSON-Werte, die der Scalar garantiert serialisieren/parst. */
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { readonly [k: string]: JsonValue };
export type JsonArray = readonly JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function assertJsonValue(value: unknown): JsonValue {
	if (value === null) return null;
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
		return value;
	}
	if (Array.isArray(value)) {
		return value.map((x) => assertJsonValue(x)) as JsonValue[];
	}
	if (isPlainObject(value)) {
		const o: Record<string, JsonValue> = {};
		for (const [k, v] of Object.entries(value)) {
			o[k] = assertJsonValue(v);
		}
		return o;
	}
	throw new GraphQLError("Ungültiger JSON-Wert", {
		extensions: { code: "BAD_USER_INPUT" },
	});
}

function parseJsonLiteral(ast: ValueNode): JsonValue {
	switch (ast.kind) {
		case Kind.STRING:
		case Kind.BOOLEAN:
			return ast.value;
		case Kind.INT:
		case Kind.FLOAT:
			return Number(ast.value);
		case Kind.NULL:
			return null;
		case Kind.LIST:
			return ast.values.map((v) => parseJsonLiteral(v)) as JsonValue[];
		case Kind.OBJECT: {
			const o: Record<string, JsonValue> = {};
			for (const f of ast.fields) {
				o[f.name.value] = parseJsonLiteral(f.value);
			}
			return o;
		}
		default:
			throw new GraphQLError(`JSON-Literal nicht unterstützt: ${ast.kind}`, {
				extensions: { code: "GRAPHQL_VALIDATION_FAILED" },
			});
	}
}

class JsonScalar extends GraphQLScalarType<JsonValue, JsonValue> {
	constructor(
		name = "JSON",
		description = "Typisierter JSON-Wert (Objekt, Array oder Primitiv)"
	) {
		super({
			name,
			description,
			serialize: assertJsonValue,
			parseValue: assertJsonValue,
			parseLiteral(ast) {
				return parseJsonLiteral(ast);
			},
		});
	}
}

export { JsonScalar }
