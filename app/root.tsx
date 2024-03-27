import '@mantine/charts/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';

import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

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
      "#0c61a2"
    ]
  },
  primaryColor: "blue",
  fontFamily: "'Open Sans', sans-serif"
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript/>
      </head>
      <body>
        <MantineProvider forceColorScheme='light' theme={theme}>
          <ModalsProvider>
            <Notifications/>
            <Outlet />
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
  throw new Error('Function not implemented.');
}

