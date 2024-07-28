import { upperFirst } from "@mantine/hooks";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import TabbedContentView from "./components/TabbedContentView";
import TitlePage from "./components/TitlePage";

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
      navigate(`/${path}/${value}`, { replace: true });
    }
  };

  return (
    <TitlePage
      title={title}
      buttonText={createLabel}
      buttonIcon={<IconPlus />}
      onButtonClick={onCreateClick}
      withDivider={false}
    >
      <TabbedContentView
        tabs={tabs.map((tab) => ({ value: tab, label: upperFirst(tab) }))}
        current={currentLocation}
        onChange={handleTabChange}
      >
        <Outlet />
      </TabbedContentView>
    </TitlePage>
  );
}
