import {
  LoadingOverlay
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useNavigation } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ItemList from "~/components/items/ItemList";
import { loader } from "./items";

export default function Page() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const data = useTypedRouteLoaderData<typeof loader>("routes/items");
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <LoadingOverlay
        visible={
          navigation.location !== undefined &&
          navigation.location.pathname !== "/items"
        }
        zIndex={1000}
      />
      <ItemList items={data && data.items || []}/>
    </>
  );
}
