import {
  Box,
  Button,
  Card,
  Center,
  Collapse,
  Divider,
  Flex,
  Loader,
  ScrollArea,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { Tag } from "@prisma/client";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { IconEdit } from "@tabler/icons-react";
import TagGroup from "./components/tags/TagGroup";
import { useDesktopOnly } from "./lib/hooks";

export interface DetailsPageProps {
  data: {
    [value: string]: {
      label: string;
      icon: React.ReactNode;
      disabled?: boolean;
    };
  };
  tags: Tag[];
  title?: string;
  desktopComponent?: React.ReactNode;
}

export default function DetailsPage({
  data,
  tags,
  title = "Unknown",
  desktopComponent,
}: DetailsPageProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

  const desktopOnly = useDesktopOnly();

  const editing = location.pathname.endsWith("/edit");

  const keys = Object.keys(data);

  let value = keys[0];

  keys.forEach((key) => {
    if (location.pathname.includes(`/${key}`)) {
      value = key;
    }
  });

  function onChange(value: string) {
    switch (value) {
      case "overview":
        navigate(`.`, {
          replace: true,
          relative: "route",
        });
        break;
      default:
        navigate(`./${value}`, {
          replace: true,
          relative: "route",
        });
        break;
    }
  }

  const pageComponent = (
    <Flex w="100%" h="100%" direction="column" align="center" wrap="nowrap">
      {desktopOnly ? (
        <>
          <Tabs
            w="100%"
            value={value}
            onChange={(value) => onChange(value ?? "")}
          >
            <Tabs.List h={50}>
              {Object.keys(data).map((key) => {
                return (
                  <Tabs.Tab
                    key={key}
                    value={key}
                    leftSection={data[key].icon}
                    disabled={data[key].disabled}
                  >
                    {data[key].label}
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>
          </Tabs>
          <ScrollArea
            w="100%"
            h="calc(100% - 50px)"
            type="always"
            scrollbars="y"
          >
            <Box p="md" w="100%">
              <Outlet />
            </Box>
          </ScrollArea>
        </>
      ) : (
        <>
          <Collapse w="100%" in={!editing}>
            <SegmentedControl
              w="100%"
              data={Object.keys(data).map((key) => {
                return {
                  value: key,
                  label: (
                    <Stack align="center" gap={0}>
                      {data[key].icon}
                      <Text size="sm">{data[key].label}</Text>
                    </Stack>
                  ),
                  disabled: data[key].disabled,
                };
              })}
              value={value}
              onChange={onChange}
            />
          </Collapse>
          <Box p="md" w="100%">
            <Outlet />
          </Box>
        </>
      )}
    </Flex>
  );

  return desktopOnly === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : desktopOnly ? (
    <Flex h="calc(100dvh - 60px)" direction="column" gap="md" p="md">
      <Flex mih={80} direction="row" justify="space-between" wrap="nowrap">
        <Stack h="100%" gap="xs">
          <TagGroup tags={tags} groupProps={{ justify: "start" }} />
          <Title order={1}>{title}</Title>
        </Stack>
        <Button h="100%" rightSection={<IconEdit />} disabled>
          Edit
        </Button>
      </Flex>
      <Divider w="100%" />
      <Flex
        w="100%"
        h="calc(100% - 80px)"
        direction="row"
        align="stretch"
        wrap="nowrap"
        gap="sm"
        style={{ overflowY: "hidden" }}
      >
        <Box w="calc(100% - 600px)" h="100%">
          {desktopComponent}
        </Box>
        <Card w={600} h="100%" p={0} withBorder>
          {pageComponent}
        </Card>
      </Flex>
    </Flex>
  ) : (
    pageComponent
  );
}
