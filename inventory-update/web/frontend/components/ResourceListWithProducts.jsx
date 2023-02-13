/* eslint-disable react/react-in-jsx-scope */
import store from "store-js";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
const url = "/api/selected-products";

const ResourceListWithProducts = () => {
  const fetch = useAuthenticatedFetch();

  // console.log("response:", response);

  (async () => {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(store.get("ids")),
      headers: { "Content-Type": "application/json" },
    });
    console.log("response :>> ", response);
  })();

  return <h2>ResourceListWithProducts</h2>;
};

export default ResourceListWithProducts;
