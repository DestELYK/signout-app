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
  useRouteError,
} from "@remix-run/react";

import {
  Box,
  ColorSchemeScript,
  Flex,
  LoadingOverlay,
  MantineProvider,
  SegmentedControl,
  createTheme,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import {
  IconClipboard,
  IconDeviceImac,
  IconHome,
  IconUser,
} from "@tabler/icons-react";
import { useRef } from "react";
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
        navigate("/");
        break;
      default:
        navigate(`/${value}`);
        break;
    }
  }

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
              <Box w="100%" h="calc(100% - 58px)">
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
                    label: <IconHome size={32} />,
                  },
                  {
                    value: "loans",
                    label: <IconClipboard size={32} />,
                  },
                  {
                    value: "items",
                    label: <IconDeviceImac size={32} />,
                  },
                  {
                    value: "people",
                    label: <IconUser size={32} />,
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
