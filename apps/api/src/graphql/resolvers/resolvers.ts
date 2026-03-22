import { mergeResolvers } from "@graphql-tools/merge";
import { CookieGraphQL } from "./cookie.js";
import { ContactsGraphQL } from "./contacts.js";
import { DashyGraphQL } from "./dashy.js";
import { DataGraphQL } from "./data.js";
import { PortfolioGraphQL } from "./portfolio.js";
import { RandomPieGraphQL } from "./randomPie.js";
import { ReceiptGraphQL } from "./receipt.js";

const resolvers = mergeResolvers([
	new CookieGraphQL().getResolvers(),
	new DataGraphQL().getResolvers(),
	new DashyGraphQL().getResolvers(),
	new ContactsGraphQL().getResolvers(),
	new PortfolioGraphQL().getResolvers(),
	new ReceiptGraphQL().getResolvers(),
	new RandomPieGraphQL().getResolvers(),
]);

export { resolvers };
