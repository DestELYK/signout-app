import { LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useNavigation } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import PeopleList from "~/components/people/PeopleList";
import { loader } from "./people";

export default function Page() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const data = useTypedRouteLoaderData<typeof loader>("routes/people");
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <LoadingOverlay
        visible={
          navigation.location !== undefined &&
          navigation.location.pathname !== "/people"
        }
        zIndex={1000}
      />
      <PeopleList people={(data && data.people) || []} />
    </>
  );
}
