import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Tabs,
  Title,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";

export interface DataPageProps {
  path: string;
  title: string;
  tabs: string[];
  createLabel?: string;
  onCreateClick?: () => void;
}

export default function DataPage({
  path,
  title,
  tabs,
  createLabel = "New",
  onCreateClick,
}: DataPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  let currentLocation = location.pathname.split("/").pop();

  if (currentLocation === path) {
    currentLocation = tabs[0];
  }

  const handleTabChange = (value: string | null) => {
    if (!value || value === tabs[0]) {
      navigate(`/${path}`, { replace: true, relative: "route" });
    } else if (currentLocation !== value) {
      navigate(`/${path}/${value}?limit=10&page=0`, { replace: true });
    }
  };

  return (
    <Box p="md">
      <Group align="center" justify="space-between" pb="md">
        <Title order={1}>{title}</Title>
        <Button onClick={onCreateClick} rightSection={<IconPlus />}>
          {createLabel}
        </Button>
      </Group>
      <Tabs
        w="100%"
        visibleFrom="md"
        value={currentLocation || tabs[0]}
        onChange={handleTabChange}
      >
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab} value={tab}>
              {upperFirst(tab)}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <SegmentedControl
        w="100%"
        hiddenFrom="md"
        value={currentLocation || tabs[0]}
        onChange={handleTabChange}
        data={tabs.map((tab) => {
          return {
            value: tab,
            label: upperFirst(tab),
          };
        })}
      />
      <Outlet />
    </Box>
  );
}
