/**
 * ToggleSchemeButton Component (Client-Side)
 *
 * A client-side button component for toggling between light and dark
 * color schemes. Provides visual feedback with appropriate icons
 * and handles theme switching through Mantine's color scheme system.
 *
 *
 * @module ToggleSchemeButton
 *
 * @author Kyle Dunn
 */

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

/**
 * A client-side button for toggling between light and dark themes
 * Uses Mantine's color scheme system for theme management
 *
 * @returns The rendered theme toggle button component
 */
export function ToggleSchemeButton() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme();

  return (
    <ActionIcon
      onClick={() =>
        // Toggle between light and dark themes
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="subtle"
      color="gray"
      aria-label="Toggle color scheme"
    >
      {/* Show sun icon in dark mode, moon icon in light mode */}
      {computedColorScheme == "dark" ? <IconSun /> : computedColorScheme == "light" && <IconMoon />}
    </ActionIcon>
  );
}
