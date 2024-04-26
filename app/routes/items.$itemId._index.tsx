import { useTypedRouteLoaderData } from "remix-typedjson";
import { loader } from "./items.$itemId";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof loader>("routes/items.$itemId");

  return (
    <>{JSON.stringify(data)}</>
  );
}
