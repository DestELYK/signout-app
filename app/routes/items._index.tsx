import { useTypedRouteLoaderData } from "remix-typedjson";
import ItemList from "~/components/items/ItemList";
import { loader } from "./items";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof loader>("routes/items");

  return (
    <ItemList
      items={data?.items}
      totalCount={data?.totalCount ?? 0}
      outstandingCount={data?.outstandingCount ?? 0}
      missingCount={data?.missingCount ?? 0}
    />
  );
}
