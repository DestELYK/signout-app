import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ToggleSchemeButton() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme();

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="subtle"
      color="gray"
      aria-label="Toggle color scheme"
    >
      {computedColorScheme == "dark" ? (
        <IconSun />
      ) : (
        computedColorScheme == "light" && <IconMoon />
      )}
    </ActionIcon>
  );
}
