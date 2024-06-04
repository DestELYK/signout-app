import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/tiptap/styles.css";

import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink as NavLinkRemix,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useNavigation,
  useRevalidator,
  useRouteError,
} from "@remix-run/react";

import { NavigationProgress, nprogress } from "@mantine/nprogress";

import {
  AppShell,
  Burger,
  Collapse,
  ColorSchemeScript,
  Group,
  Image,
  MantineProvider,
  NavLink,
  Stack,
  Text,
  createTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import {
  IconClipboard,
  IconDeviceImac,
  IconHome,
  IconUser,
} from "@tabler/icons-react";
import { clearInterval, setInterval } from "node:timers";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import ErrorPage from "./components/ErrorPage";
import { ToggleSchemeButton } from "./components/ToggleSchemeButton.client";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

const theme = createTheme({
  colors: {
    blue: [
      "#ecf6fe",
      "#d8e9f7",
      "#abd2f0",
      "#7dbaec",
      "#59a5e7",
      "#4598e5",
      "#3a92e5",
      "#2e7fcc",
      "#2471b7",
      "#0c61a2",
    ],
  },
  primaryColor: "blue",
  fontFamily: "'Open Sans', sans-serif",
});

export const meta: MetaFunction = () => {
  return [{ name: "theme-color", content: "#ffffff" }];
};

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body style={{ width: "100dvw", height: "100dvh", overflow: "hidden" }}>
        <MantineProvider defaultColorScheme="light" theme={theme}>
          <ModalsProvider>
            <Notifications />
            <ErrorPage error={error} />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [opened, { toggle }] = useDisclosure();
  const [offline, setOffline] = useState<boolean | undefined>();

  let value = "home";

  if (location.pathname === "/") {
    value = "home";
  } else if (location.pathname.startsWith("/loans")) {
    value = "loans";
  } else if (location.pathname.startsWith("/items")) {
    value = "items";
  } else if (location.pathname.startsWith("/people")) {
    value = "people";
  }

  // TODO - Move to specific pages
  // // Refresh data every 5 minutes
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     notifications.show({
  //       message: "Refreshing data...",
  //     });

  //     revalidator.revalidate();
  //   }, 1000 * 60 * 5);

  //   return () => clearInterval(timer);
  // });

  // Start and stop nprogress depending on navigation state
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

  // Check if the user is offline
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch("/api/health-check");

        if (offline && response.status === 200) {
          setOffline(false);
          setTimeout(() => {
            window.location.reload();
            setOffline(undefined);
          }, 2000);
        } else {
          setOffline(undefined);
        }
      } catch (error) {
        setOffline(true);
      }
    }, 1000 * 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="light" theme={theme}>
          <ModalsProvider>
            <Notifications />
            <NavigationProgress />
            <AppShell
              header={{ height: 60 + (offline ? 20 : 0) }}
              navbar={{
                width: { base: 300, md: 200 },
                breakpoint: "sm",
                collapsed: { mobile: !opened },
              }}
            >
              <AppShell.Header>
                <Stack gap={0}>
                  <Group h="100%" px="md" justify="space-between">
                    <Group>
                      <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                      />
                      <Link to="/">
                        <Image
                          src="/logo.png"
                          alt="SJK"
                          fit="contain"
                          p={5}
                          width={200}
                          height={60}
                        />
                      </Link>
                    </Group>
                    <Group justify="end">
                      <ClientOnly fallback={null}>
                        {() => <ToggleSchemeButton />}
                      </ClientOnly>
                    </Group>
                  </Group>
                  <Collapse h={20} in={offline !== undefined}>
                    <Text ta="center" bg={offline ? "red" : "green"} c="white">
                      You are {offline ? "offline" : "online. Reloading..."}
                    </Text>
                  </Collapse>
                </Stack>
              </AppShell.Header>
              <AppShell.Navbar py="md">
                <NavLink
                  to="/"
                  component={NavLinkRemix}
                  label="Home"
                  leftSection={<IconHome size={24} />}
                  onClick={toggle}
                  active={value === "home"}
                />
                <NavLink
                  to="/loans?limit=15"
                  component={NavLinkRemix}
                  label="Loans"
                  leftSection={<IconClipboard size={24} />}
                  onClick={toggle}
                  active={value === "loans"}
                />
                <NavLink
                  to="/items?limit=15"
                  component={NavLinkRemix}
                  label="Items"
                  leftSection={<IconDeviceImac size={24} />}
                  onClick={toggle}
                  active={value === "items"}
                />
                <NavLink
                  to="/people?limit=15"
                  component={NavLinkRemix}
                  label="People"
                  leftSection={<IconUser size={24} />}
                  onClick={toggle}
                  active={value === "people"}
                />
              </AppShell.Navbar>
              <AppShell.Main w="100%" h="100dvh">
                <Outlet />
              </AppShell.Main>
            </AppShell>
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
