import { GraphQLScalarType, Kind, type ValueNode } from "graphql";
import { GraphQLError } from "graphql";

class DashboardDateScalar extends GraphQLScalarType<Date, string> {
	constructor() {
		super({
			name: "Date",
			description: "Datum als ISO-8601-String; Literale: String oder Int (ms seit Epoch)",
			serialize: DashboardDateScalar.serializeDate,
			parseValue: DashboardDateScalar.parseValueDate,
			parseLiteral: DashboardDateScalar.parseLiteralToDate,
		});
	}

	private static serializeDate(value: unknown): string {
		if (value instanceof Date) {
			return value.toISOString();
		}
		throw new GraphQLError("DashboardDate serialize erwartet Date", {
			extensions: { code: "INTERNAL_SERVER_ERROR" },
		});
	}

	private static parseValueDate(value: unknown): Date {
		if (typeof value === "string") {
			const d = new Date(value);
			if (Number.isNaN(d.getTime())) {
				throw new GraphQLError("DashboardDate: ungültige ISO-Zeichenkette", {
					extensions: { code: "BAD_USER_INPUT" },
				});
			}
			return d;
		}
		throw new GraphQLError("DashboardDate parseValue erwartet string", {
			extensions: { code: "BAD_USER_INPUT" },
		});
	}

	private static parseLiteralToDate(ast: ValueNode): Date {
		if (ast.kind === Kind.STRING) {
			const d = new Date(ast.value);
			if (Number.isNaN(d.getTime())) {
				throw new GraphQLError("DashboardDate: ungültige ISO-Zeichenkette", {
					extensions: { code: "BAD_USER_INPUT" },
				});
			}
			return d;
		}
		if (ast.kind === Kind.INT) {
			return new Date(parseInt(ast.value, 10));
		}
		throw new GraphQLError("DashboardDate: Literal muss String oder Int sein", {
			extensions: { code: "BAD_USER_INPUT" },
		});
	}
}

export { DashboardDateScalar }
