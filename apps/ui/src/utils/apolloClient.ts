import {
	ApolloClient,
	ApolloLink,
	HttpLink,
	InMemoryCache,
	from,
} from "@apollo/client";
import { globalVars } from "./globalyVar";

const base = (globalVars.API_URL || "").replace(/\/$/, "");
const graphqlUri = `${base}/graphql`;

const httpLink = new HttpLink({
	uri: graphqlUri,
});

const authLink = new ApolloLink((operation, forward) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("authentication");
		operation.setContext({
			headers: {
				authorization: token ? token : "",
			},
		});
	}
	return forward(operation);
});

const client = new ApolloClient({
	link: from([authLink, httpLink]),
	cache: new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					/** Explizite Cache-Keys; vermeidet Überraschungen bei erweiterten Feld-Policys. */
					datas: {
						keyArgs: ["dataType", "pagination", "search", "sort"],
					},
				},
			},
		},
	}),
	defaultOptions: {
		watchQuery: {
			fetchPolicy: "cache-and-network",
			nextFetchPolicy: "cache-first",
		},
	},
});

export default client;
