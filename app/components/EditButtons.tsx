import { ActionIcon, Button, Group } from "@mantine/core";
import { IconArrowBackUp, IconDeviceFloppy } from "@tabler/icons-react";

export interface EditButtonsProps {
  iconOnly?: boolean;
  onRevert?: () => void;
  onSave?: () => void;
}

export default function EditButtons({ iconOnly = false, onRevert, onSave }: EditButtonsProps) {
  return iconOnly ? (
    <Group align="center" justify="end">
      <ActionIcon color="red" variant="subtle" onClick={onRevert}>
        <IconArrowBackUp />
      </ActionIcon>
      <ActionIcon color="blue" variant="subtle" onClick={onSave}>
        <IconDeviceFloppy />
      </ActionIcon>
    </Group>
  ) : (
    <Group align="center" justify="end" grow>
      <Button
        variant="outline"
        color="red"
        leftSection={<IconArrowBackUp />}
        onClick={onRevert}
      >
        Revert
      </Button>
      <Button
        variant="outline"
        color="blue"
        leftSection={<IconDeviceFloppy />}
        onClick={onSave}
      >
        Save
      </Button>
    </Group>
  );
}
