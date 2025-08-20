/**
 * Person roles index route displaying list of all person roles with creation functionality
 *
 * This route serves as the default view for person roles management including:
 * - list of all person roles
 * - Create new person role modal functionality
 * - Search and filtering capabilities
 * - Navigation to individual role details
 * - Responsive layout with desktop/mobile variants
 *
 * @requires ListView component for role display
 * @requires PersonRoleForm for role creation
 * @requires Modal for creation workflow
 * @inherits loader data from parent people.roles route
 *
 * @module routes/people/roles/index
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
import PersonRoleForm from "~/components/forms/PersonRoleForm";
import { useDesktopOnly } from "~/lib/hooks";
import { loader as rolesLoader } from "./people.roles";

/**
 * Person roles index component
 * Renders comprehensive person roles list with creation functionality
 *
 * @returns JSX element containing roles list and creation modal
 */
export default function Page() {
  // Get person roles data from parent route loader
  const data = useTypedRouteLoaderData<typeof rolesLoader>("routes/people.roles");
  const navigate = useNavigate();

  // Responsive hook for layout adaptation
  const desktopOnly = useDesktopOnly();

  // Quick action button for creating new person roles
  const rightSection = (
    <ActionIcon size="input-sm" onClick={() => open()} color="blue">
      <IconPlus />
    </ActionIcon>
  );

  // Modal state management
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      {/* Create person role modal */}
      <Modal opened={opened} onClose={close} centered={true} title={"Create New Person Role"}>
        <PersonRoleForm
          initialValues={{
            name: "",
            color: "#000000",
          }}
          type="create"
          onResult={(data) => {
            close();

            navigate(`/people/roles/${data.data?.id}`);
          }}
          validateInputOnBlur={false}
        />
      </Modal>
      {desktopOnly ? (
        <Card w="100%" h="100%" withBorder>
          <Center w="100%" h="100%">
            <Text c="dimmed">No person role selected</Text>
          </Center>
        </Card>
      ) : desktopOnly === undefined || data === undefined ? (
        <Stack w="100%" h="100%" justify="center" align="center">
          <Loader />
          <Text className="loading-text">Loading</Text>
        </Stack>
      ) : (
        <Stack w="100%" p="md">
          <ListView
            w="100%"
            h="calc(100% - 40px)"
            initialItemsPerPage={30}
            data={data.data}
            showPagination={false}
            withQRCode={false}
            error={data.error}
            rightSearchSection={rightSection}
            searchPlaceholder="Search for person roles..."
            emptyText="No person role found"
          >
            {(personRole, query) => (
              <UnstyledButton
                className="list-item"
                w="100%"
                h="100%"
                onClick={() => navigate(`/people/roles/${personRole.id}`)}
                p="xs"
              >
                <Flex direction="row" align="center" justify="space-between">
                  <Highlight highlight={query ? query.split(" ") : ""}>{personRole.name}</Highlight>
                  <IconChevronRight />
                </Flex>
              </UnstyledButton>
            )}
          </ListView>
        </Stack>
      )}
    </>
  );
}
