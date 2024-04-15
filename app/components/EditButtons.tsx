import { ActionIcon, Button, Flex, Group } from "@mantine/core";
import { IconArrowBackUp, IconDeviceFloppy } from "@tabler/icons-react";

export interface EditButtonsProps {
  iconOnly?: boolean;
  onRevert?: () => void;
  onSave?: () => void;
}

export default function EditButtons({ iconOnly = false, onRevert, onSave }: EditButtonsProps) {
  return iconOnly ? (
    <Flex direction="row" align="center" justify="end" wrap="nowrap" gap="xs">
      <ActionIcon color="red" variant="outline" onClick={onRevert}>
        <IconArrowBackUp />
      </ActionIcon>
      <ActionIcon color="blue" variant="outline" onClick={onSave}>
        <IconDeviceFloppy />
      </ActionIcon>
    </Flex>
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
