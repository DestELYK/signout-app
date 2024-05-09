import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";

import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useMatches,
  useNavigation,
  useRevalidator,
  useRouteError,
} from "@remix-run/react";

import {
  AppShell,
  Burger,
  ColorSchemeScript,
  Group,
  Image,
  LoadingOverlay,
  MantineProvider,
  NavLink,
  createTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications, notifications } from "@mantine/notifications";
import { IconClipboard, IconDeviceImac, IconUser } from "@tabler/icons-react";
import { clearInterval, setInterval } from "node:timers";
import { useEffect } from "react";
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
  const revalidator = useRevalidator();
  const [opened, { toggle }] = useDisclosure();
  const matches = useMatches();

  const filteredMatches = matches.filter(
    (match) => !match.pathname.endsWith("/")
  );

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

  // Refresh data every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      notifications.show({
        message: "Refreshing data...",
      });

      revalidator.revalidate();
    }, 1000 * 60 * 5);

    return () => clearInterval(timer);
  });

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
            <AppShell
              header={{ height: 60 }}
              navbar={{
                width: { base: 300, md: 200 },
                breakpoint: "sm",
                collapsed: { mobile: !opened },
              }}
            >
              <AppShell.Header>
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
              </AppShell.Header>
              <AppShell.Navbar py="md">
                <NavLink
                  href="/loans?limit=15"
                  label="Loans"
                  opened={value === "loans"}
                  leftSection={<IconClipboard size={24} />}
                  active={value === "loans"}
                >
                  {value === "loans" && filteredMatches.length > 1 && (
                    <NavLink
                      key={filteredMatches[1].pathname}
                      href={filteredMatches[1].pathname}
                      label={filteredMatches[1].pathname}
                      active={filteredMatches[1].pathname === location.pathname}
                    >
                      {filteredMatches.length > 2 && (
                        <NavLink
                          key={filteredMatches[2].pathname}
                          href={filteredMatches[2].pathname}
                          label={filteredMatches[2].pathname}
                          active={
                            filteredMatches[2].pathname === location.pathname
                          }
                        >
                          {filteredMatches.length > 3 && (
                            <NavLink
                              key={filteredMatches[3].pathname}
                              href={filteredMatches[3].pathname}
                              label={filteredMatches[3].pathname}
                              active={
                                filteredMatches[3].pathname ===
                                location.pathname
                              }
                            ></NavLink>
                          )}
                        </NavLink>
                      )}
                    </NavLink>
                  )}
                </NavLink>
                <NavLink
                  href="/items?limit=15"
                  label="Items"
                  leftSection={<IconDeviceImac size={24} />}
                  active={value === "items"}
                />
                <NavLink
                  href="/people?limit=15"
                  label="People"
                  leftSection={<IconUser size={24} />}
                  active={value === "people"}
                />
              </AppShell.Navbar>
              <AppShell.Main w="100%" h="calc(100dvh - 120px)">
                <LoadingOverlay
                  visible={
                    navigation.location !== undefined &&
                    navigation.location.pathname !== location.pathname
                  }
                  zIndex={1000}
                />
                <Outlet />
                {/* <SegmentedControl
                fullWidth
                data={[
                  {
                    value: "home",
                    label: (
                      <Stack align="center" gap={0}>
                        <IconHome size={24} />
                        <Text size="sm">Home</Text>
                      </Stack>
                    ),
                  },
                  {
                    value: "loans",
                    label: (
                      <Stack align="center" gap={0}>
                        <IconClipboard size={24} />
                        <Text size="sm">Loans</Text>
                      </Stack>
                    ),
                  },
                  {
                    value: "items",
                    label: (
                      <Stack align="center" gap={0}>
                        <IconDeviceImac size={24} />
                        <Text size="sm">Items</Text>
                      </Stack>
                    ),
                  },
                  {
                    value: "people",
                    label: (
                      <Stack align="center" gap={0}>
                        <IconUser size={24} />
                        <Text size="sm">People</Text>
                      </Stack>
                    ),
                  },
                  {
                    value: "settings",
                    label: (
                      <Stack align="center" gap={0}>
                        <IconSettings size={24} />
                        <Text size="sm">Settings</Text>
                      </Stack>
                    ),
                    disabled: true,
                  },
                ]}
                value={value}
                onChange={onChange}
                onClick={() => onChange(value)}
              /> */}
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
function rgb(arg0: number, arg1: number, arg2: number): string {
  throw new Error("Function not implemented.");
}
