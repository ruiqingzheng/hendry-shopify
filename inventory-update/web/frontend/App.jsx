/* eslint-disable react/react-in-jsx-scope */
import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  fetchOptions: {
    credentials: "include",
  },
  cache: new InMemoryCache(),
  // uri: 'https://api.github.com/graphql',
  // cache: new InMemoryCache(),
  // headers: {
  //   Authorization: `bearer ` + import.meta.env.VITE_API_KEY,
  // },
});

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <ApolloProvider client={client}>
              <Routes pages={pages} />
            </ApolloProvider>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
