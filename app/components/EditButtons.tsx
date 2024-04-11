import { ActionIcon, Button, Group } from "@mantine/core";
import { IconArrowBackUp, IconDeviceFloppy } from "@tabler/icons-react";

export interface EditButtonsProps {
  iconOnly?: boolean;
}

export default function EditButtons({ iconOnly = false }: EditButtonsProps) {
  return iconOnly ? (
    <Group align="center" justify="end">
      <ActionIcon color="red" variant="subtle" type="reset">
        <IconArrowBackUp />
      </ActionIcon>
      <ActionIcon color="blue" variant="subtle" type="submit">
        <IconDeviceFloppy />
      </ActionIcon>
    </Group>
  ) : (
    <Group align="center" justify="end" grow>
      <Button
        variant="outline"
        color="red"
        type="reset"
        leftSection={<IconArrowBackUp />}
      >
        Revert
      </Button>
      <Button
        variant="outline"
        color="blue"
        type="submit"
        leftSection={<IconDeviceFloppy />}
      >
        Save
      </Button>
    </Group>
  );
}
