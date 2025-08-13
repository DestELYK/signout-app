import { ActionIcon, Button, Flex } from "@mantine/core";
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

    let currentLocation = tabs.find((tab) => location.pathname.includes(tab)) || tabs[0];

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

    const rightSection = createLabel && onCreateClick && (
        <>
            <ActionIcon onClick={onCreateClick} size="input-sm" color="blue" hiddenFrom="sm">
                <IconPlus />
            </ActionIcon>
            <Button onClick={onCreateClick} color="blue" visibleFrom="sm">
                {createLabel}
            </Button>
        </>
    );

    return (
        <Flex pos="relative" w="100%" h="calc(100dvh - 60px)" direction="column">
            <div
                style={{
                    position: "sticky",
                    top: 60,
                    zIndex: 10,
                    backgroundColor: "var(--mantine-color-body)",
                    boxShadow: "var(--mantine-shadow-sm)",
                }}
            >
                <TitlePage title={title} rightSection={rightSection} withDivider={false} />
                <TabbedContentView
                    tabs={tabs.map((tab) => ({ value: tab, label: upperFirst(tab) }))}
                    current={currentLocation}
                    onChange={handleTabChange}
                />
            </div>
            <Outlet />
        </Flex>
    );
}
