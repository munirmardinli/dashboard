import {
	ApolloClient,
	ApolloLink,
	HttpLink,
	InMemoryCache,
	from,
} from "@apollo/client";

const apiBase =
	process.env.NEXT_PUBLIC_API_URL ??
	(process.env.NODE_ENV === "production" ? "" : "http://localhost:4012");
const graphqlUri = `${apiBase.replace(/\/$/, "")}/graphql`;

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
