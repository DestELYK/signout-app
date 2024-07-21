import {
  Box,
  Center,
  Collapse,
  Flex,
  Loader,
  ScrollArea,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { useDesktopOnly } from "./lib/hooks";

export interface ItemPageProps {
  data: {
    [value: string]: {
      label: string;
      icon: React.ReactNode;
      disabled?: boolean;
    };
  };
}

export default function DetailsPage({ data }: ItemPageProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

  const desktopOnly = useDesktopOnly();

  const editing = location.pathname.endsWith("/edit");

  let value = "overview";

  Object.keys(data).forEach((key) => {
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
  return desktopOnly === undefined ? (
    <Center h="100%">
      <Loader />
    </Center>
  ) : (
    <>
      <Flex w="100%" h="100%" direction="column" align="center" wrap="nowrap">
        {desktopOnly ? (
          <>
            <Tabs
              w="100%"
              value={value}
              onChange={(value) => onChange(value ?? "")}
            >
              <Tabs.List mb="sm">
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

              <Outlet />
            </Tabs>
          </>
        ) : (
          <>
            <Flex
              w="100%"
              direction="column"
              align="center"
              wrap="nowrap"
              gap="sm"
              p="sm"
              style={{ boxShadow: "0px 2px 6px 2px #8686862d", zIndex: 10 }}
            >
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
            </Flex>
            <ScrollArea.Autosize h="100%" w="100%" type="always" scrollbars="y">
              <Box p="md" w="100%">
                <Outlet />
              </Box>
            </ScrollArea.Autosize>
          </>
        )}
      </Flex>
    </>
  );
}
