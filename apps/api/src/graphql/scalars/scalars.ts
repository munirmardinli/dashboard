import { mergeResolvers } from "@graphql-tools/merge";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import { DateTimeResolver } from "graphql-scalars";
import { DashboardDateScalar } from "./dateScalar.js";
import { JsonScalar } from "./jsonScalar.js";

const jsonScalar = new JsonScalar();
const cookieDocumentScalar = new JsonScalar(
	"CookieDocument",
	"Inhalt von docs/cookie.json (beliebige Keys; Merge über updateCookie)"
);
const dashboardDateScalar = new DashboardDateScalar();

const scalars = mergeResolvers([
	{ Upload: GraphQLUpload },
	{ DateTime: DateTimeResolver },
	{ JSON: jsonScalar },
	{ CookieDocument: cookieDocumentScalar },
	{ Date: new DashboardDateScalar() },
]);

export { scalars, jsonScalar, dashboardDateScalar };
