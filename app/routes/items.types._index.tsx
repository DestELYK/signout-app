/**
 * Item types index route displaying list of all item types with creation functionality
 *
 * This route serves as the default view for item types management including:
 * - list of all item types
 * - Create new item type modal functionality
 * - Search and filtering capabilities
 * - Navigation to individual item type details
 * - Responsive layout with desktop/mobile variants
 *
 * @requires ListView component for type display
 * @requires ItemTypeForm for type creation
 * @requires Modal for creation workflow
 * @inherits loader data from parent items.types route
 *
 * @module routes/items/types/index
 *
 * @author Kyle Dunn
 */

import {
  ActionIcon,
  Card,
  Center,
  Flex,
  Highlight,
  Loader,
  Modal,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "@remix-run/react";
import { IconChevronRight, IconPlus } from "@tabler/icons-react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ListView from "~/components/base/ListView";
import ItemTypeForm from "~/components/forms/ItemTypeForm";
import { loader as itemTypesLoader } from "./items.types";

/**
 * Item types index component
 * Renders comprehensive item types list with creation functionality
 *
 * @returns JSX element containing item types list and creation modal
 */
export default function Page() {
  // Get item types data from parent route loader
  const data = useTypedRouteLoaderData<typeof itemTypesLoader>("routes/items.types");
  const navigate = useNavigate();

  // Modal state
  const [opened, { open, close }] = useDisclosure();

  // Quick action button for creating new item types
  const rightSection = (
    <ActionIcon size="input-sm" onClick={() => open()} color="blue">
      <IconPlus />
    </ActionIcon>
  );

  return (
    <>
      {/* Create item type modal */}
      <Modal opened={opened} onClose={close} centered={true} title={"Create New Item Type"}>
        <ItemTypeForm
          initialValues={{
            name: "",
            description: "",
          }}
          type="create"
          onResult={(data) => {
            close();

            navigate(`/items/types/${data.data?.id}`);
          }}
          validateInputOnBlur={false}
        />
      </Modal>

      {data === undefined ? (
        <Stack w="100%" h="100%" justify="center" align="center">
          <Loader />
          <Text className="loading-text">Loading</Text>
        </Stack>
      ) : (
        <>
          {/* Desktop Layout */}
          <Card w="100%" h="100%" withBorder visibleFrom="md">
            <Center w="100%" h="100%">
              <Text c="dimmed">No item type selected</Text>
            </Center>
          </Card>

          {/* Mobile Layout */}
          <Stack w="100%" p="md" hiddenFrom="md">
            <ListView
              w="100%"
              h="calc(100% - 40px)"
              initialItemsPerPage={30}
              data={data.data}
              showPagination={false}
              withQRCode={false}
              searchPlaceholder="Search for item types..."
              emptyText="No item type found"
              error={data.error}
              rightSearchSection={rightSection}
            >
              {(itemType, query) => (
                <UnstyledButton
                  className="list-item"
                  w="100%"
                  h="100%"
                  onClick={() => navigate(`/items/types/${itemType.id}`)}
                  p="xs"
                >
                  <Flex direction="row" align="center" justify="space-between">
                    <Highlight highlight={query ? query.split(" ") : ""}>{itemType.name}</Highlight>
                    <IconChevronRight />
                  </Flex>
                </UnstyledButton>
              )}
            </ListView>
          </Stack>
        </>
      )}
    </>
  );
}
