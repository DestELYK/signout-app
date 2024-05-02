import { useTypedRouteLoaderData } from "remix-typedjson";
import PeopleList from "~/components/people/PeopleList";
import { loader } from "./people";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof loader>("routes/people");

  return (
    <PeopleList
      people={(data && data.people) || []}
      totalCount={data?.totalCount ?? 0}
      studentCount={data?.studentCount ?? 0}
      staffCount={data?.staffCount ?? 0}
    />
  );
}
