/**
 * Root Application Component
 *
 * The main application root that sets up the global layout, theme,
 * providers, and navigation structure. This component serves as the
 * foundation for the entire signout application.
 *
 *
 * @module Root
 *
 * @author Kyle Dunn
 */

import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "mantine-react-table/styles.css";
import "./styles.css";

import type { MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  NavLink as NavLinkRemix,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
  useRouteError,
} from "@remix-run/react";

import { NavigationProgress, nprogress } from "@mantine/nprogress";

import {
  AppShell,
  Burger,
  ColorSchemeScript,
  Divider,
  Group,
  Image,
  MantineProvider,
  NavLink,
  Stack,
  createTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import {
  IconBug,
  IconClipboard,
  IconDeviceImac,
  IconHome,
  IconMapPin,
  IconTag,
  IconUser,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { ClientOnly } from "remix-utils/client-only";
import ErrorPage from "./components/ErrorPage";
import { ToggleSchemeButton } from "./components/ToggleSchemeButton.client";
import "./tailwind.css";

/** Application theme configuration with custom color palette */
const theme = createTheme({
  colors: {
    blue: [
      "#e1f9ff",
      "#ccedff",
      "#9ad7ff",
      "#64c1ff",
      "#3baefe",
      "#20a2fe",
      "#099cff",
      "#0088e4",
      "#0078cd",
      "#0069b6",
    ],
    red: [
      "#ffe9e9",
      "#ffd1d1",
      "#fba0a1",
      "#f76d6d",
      "#f34141",
      "#f22625",
      "#f21616",
      "#d8070b",
      "#c10008",
      "#a90003",
    ],
    green: [
      "#e5feee",
      "#d2f9e0",
      "#a8f1c0",
      "#7aea9f",
      "#53e383",
      "#3bdf70",
      "#2bdd66",
      "#1ac455",
      "#0caf49",
      "#00963c",
    ],
  },
  primaryColor: "blue",
  fontFamily: "'Open Sans', sans-serif",
});

/**
 * Meta function for document head configuration
 * @returns Array of meta tags
 */
export const meta: MetaFunction = () => {
  return [{ name: "theme-color", content: "#ffffff" }];
};

/**
 * Root application component that provides the base layout and providers
 * @param children - Child components to render
 * @returns The root application structure
 */
function Root({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const location = useLocation();
  // const navigate = useNavigate();
  // const revalidator = useRevalidator();
  const [opened, { open, close, toggle }] = useDisclosure();

  /** Start and stop nprogress depending on navigation state */
  useEffect(() => {
    if (navigation.state !== "idle") {
      nprogress.start();
    } else {
      nprogress.complete();
    }

    return () => {
      nprogress.reset();
    };
  }, [navigation.state]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto" theme={theme}>
          <ModalsProvider>
            <Notifications />
            <NavigationProgress />
            <AppShell
              header={{ height: 60 }}
              navbar={{
                width: { base: 200, md: 150 },
                breakpoint: "sm",
                collapsed: { mobile: !opened },
              }}
            >
              <AppShell.Header>
                <Stack w="100%" gap={0}>
                  <Group h="100%" px="md" justify="space-between">
                    <Group>
                      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                      <Link to="/">
                        <Image
                          src="/logo.webp"
                          alt="SJK"
                          fit="contain"
                          p={5}
                          h={60}
                          visibleFrom="sm"
                        />
                        <Image
                          src="/logo-short.webp"
                          alt="SJK"
                          fit="contain"
                          p={5}
                          h={60}
                          hiddenFrom="sm"
                        />
                      </Link>
                    </Group>
                    <Group justify="end">
                      <ClientOnly fallback={null}>{() => <ToggleSchemeButton />}</ClientOnly>
                    </Group>
                  </Group>
                </Stack>
              </AppShell.Header>
              <AppShell.Navbar py="md">
                <NavLink
                  to="/"
                  component={NavLinkRemix}
                  label="Home"
                  leftSection={<IconHome size={24} />}
                  onClick={close}
                />
                <NavLink
                  to="/loans"
                  component={NavLinkRemix}
                  label="Loans"
                  leftSection={<IconClipboard size={24} />}
                  onClick={close}
                />
                <NavLink
                  to="/items"
                  component={NavLinkRemix}
                  label="Items"
                  leftSection={<IconDeviceImac size={24} />}
                  onClick={close}
                />
                <NavLink
                  to="/people"
                  component={NavLinkRemix}
                  label="People"
                  leftSection={<IconUser size={24} />}
                  onClick={close}
                />
                <Stack mt="auto" gap={0}>
                  <Divider />
                  <NavLink
                    to="/locations"
                    component={NavLinkRemix}
                    label="Locations"
                    leftSection={<IconMapPin size={24} />}
                    onClick={close}
                  />
                  <NavLink
                    to="/tags"
                    component={NavLinkRemix}
                    label="Tags"
                    leftSection={<IconTag size={24} />}
                    onClick={close}
                  />
                  <Divider />
                  <NavLink
                    to="/report"
                    component={NavLinkRemix}
                    label="Report"
                    leftSection={<IconBug size={24} />}
                    onClick={close}
                  />
                </Stack>
              </AppShell.Navbar>
              <AppShell.Main w="100%" h="100dvh">
                {children}
              </AppShell.Main>
            </AppShell>
            <ScrollRestoration />
            <Scripts />
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <Root>
      <ErrorPage error={error} />
    </Root>
  );
}

export default function App() {
  return (
    <Root>
      <Outlet />
    </Root>
  );
}
