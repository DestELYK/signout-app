import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/tiptap/styles.css";
import "mantine-react-table/styles.css";
import "./styles.css";

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
  useNavigation,
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
  Title,
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
  IconTag,
  IconUser,
} from "@tabler/icons-react";
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

function Root({
  offline = false,
  children,
}: {
  offline?: boolean;
  children: React.ReactNode;
}) {
  const navigation = useNavigation();
  const location = useLocation();
  // const navigate = useNavigate();
  // const revalidator = useRevalidator();
  const [opened, { open, close, toggle }] = useDisclosure();
  const [_offline, setOffline] = useState<boolean | undefined>(
    offline ? true : undefined
  );

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

  // // Check if the user is offline
  // useEffect(() => {
  //   const timer = setInterval(async () => {
  //     try {
  //       const response = await fetch("/api/health-check");

  //       if (offline && response.status === 200) {
  //         setOffline(false);
  //         setTimeout(() => {
  //           window.location.reload();
  //           setOffline(undefined);
  //         }, 2000);
  //       } else {
  //         setOffline(undefined);
  //       }
  //     } catch (error) {
  //       setOffline(true);
  //     }
  //   }, 1000 * 30);

  //   return () => clearInterval(timer);
  // }, []);

  useEffect(() => {
    if (_offline && !offline) {
      setOffline(false);
      setTimeout(() => {
        window.location.reload();
        setOffline(undefined);
      }, 2000);
    } else {
      setOffline(undefined);
    }
  }, [offline]);

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
                width: { base: 200, md: 150 },
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
                      <Group gap={0} align="center">
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
                        <Title
                          pt={5}
                          c="#006297"
                          order={1}
                          fw={500}
                          style={{ fontFamily: "'Open Sans', sans-serif" }}
                        >
                          Signout
                        </Title>
                      </Group>
                    </Group>
                    <Group justify="end">
                      <ClientOnly fallback={null}>
                        {() => <ToggleSchemeButton />}
                      </ClientOnly>
                    </Group>
                  </Group>
                  <Collapse h={20} in={_offline !== undefined}>
                    <Text ta="center" bg={_offline ? "red" : "green"} c="white">
                      You are {_offline ? "offline" : "online. Reloading..."}
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
                  <NavLink
                    to="/tags"
                    component={NavLinkRemix}
                    label="Tags"
                    leftSection={<IconTag size={24} />}
                    onClick={close}
                  />
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
            <LiveReload />
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
