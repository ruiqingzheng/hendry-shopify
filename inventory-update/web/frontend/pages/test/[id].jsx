/* eslint-disable react/react-in-jsx-scope */
import { useParams } from "react-router-dom";
export default function Test() {
  const { id } = useParams();
  return (
    <>
      <h2>this is test page, product id: {id}</h2>
    </>
  );
}
