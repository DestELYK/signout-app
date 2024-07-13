import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Tabs,
  Title,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import { useDesktopOnly } from "./lib/hooks";

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
  const desktopOnly = useDesktopOnly();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  let currentLocation = location.pathname.split("/").pop();

  if (currentLocation === path) {
    currentLocation = tabs[0];
  }

  const handleTabChange = (value: string | null) => {
    if (!value || value === tabs[0]) {
      navigate(`/${path}`, { replace: true, relative: "route" });
    } else if (currentLocation !== value) {
      navigate(`/${path}/${value}`, { replace: true });
    }
  };

  return (
    <Box p="md">
      <Group
        pos="relative"
        top={0}
        align="center"
        justify="space-between"
        pb="md"
        visibleFrom="md"
      >
        <Title order={1}>{title}</Title>
        <Button onClick={onCreateClick} rightSection={<IconPlus />}>
          {createLabel}
        </Button>
      </Group>

      <Tabs
        pos="relative"
        top={0}
        w="100%"
        mb="sm"
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
        pos="relative"
        top={0}
        w="100%"
        mb="sm"
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

      <Button
        pos="relative"
        top={0}
        w="100%"
        onClick={onCreateClick}
        rightSection={<IconPlus />}
        mb="md"
        hiddenFrom="md"
      >
        {createLabel}
      </Button>
      <Outlet />
    </Box>
  );
}
