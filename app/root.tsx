import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";

import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useNavigation,
  useRevalidator,
  useRouteError,
} from "@remix-run/react";

import {
  Box,
  ColorSchemeScript,
  Flex,
  LoadingOverlay,
  MantineProvider,
  SegmentedControl,
  Stack,
  Text,
  createTheme,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications, notifications } from "@mantine/notifications";
import {
  IconClipboard,
  IconDeviceImac,
  IconHome,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { clearInterval, setInterval } from "node:timers";
import { useEffect, useRef } from "react";
import ErrorPage from "./components/ErrorPage";

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
  const navigate = useNavigate();
  const bodyRef = useRef<HTMLBodyElement>(null);
  const location = useLocation();
  const revalidator = useRevalidator();
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

  function onChange(value: string) {
    switch (value) {
      case "home":
        if (location.pathname === "/") return;
        navigate("/");
        break;
      default:
        if (location.pathname === `/${value}`) return;
        navigate(`/${value}?limit=15`);
        break;
    }
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
            <Flex
              direction="column"
              h="100dvh"
              w="100dvw"
              style={{ overflow: "hidden" }}
            >
              <Box w="100%" h="calc(100% - 62px)">
                <LoadingOverlay
                  visible={
                    navigation.location !== undefined &&
                    navigation.location.pathname !== location.pathname
                  }
                  zIndex={1000}
                />
                <Outlet />
              </Box>
              <SegmentedControl
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
              />
            </Flex>
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
