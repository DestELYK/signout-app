import {
  ActionIcon,
  Collapse,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { IconArrowLeft, IconEdit } from "@tabler/icons-react";
import InfoView from "./components/InfoView";

export interface ItemPageProps {
  title: string;
  data: {
    [value: string]: { label: string; icon: React.ReactNode };
  };
  default?: string;
  loading?: boolean;
}

export default function ItemDetailsPage({
  title,
  data,
  loading,
}: ItemPageProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

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
  return (
    <InfoView
      title={title}
      loading={loading}
      leftSection={
        <ActionIcon variant="subtle" color="gray" onClick={() => navigate(-1)}>
          <IconArrowLeft />
        </ActionIcon>
      }
      rightSection={
        !editing && (
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => navigate("./edit", { relative: "route" })}
          >
            <IconEdit />
          </ActionIcon>
        )
      }
    >
      <Collapse mb="sm" w="100%" in={!editing}>
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
            };
          })}
          value={value}
          onChange={onChange}
        />
      </Collapse>
      <ScrollArea type="auto" scrollbars="y">
        <Outlet />
      </ScrollArea>
    </InfoView>
  );
}
