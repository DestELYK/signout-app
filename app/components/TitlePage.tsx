import { ActionIcon, Button, Divider, Flex, Stack, Title } from "@mantine/core";
import { Tag } from "@prisma/client";
import { useDesktopOnly } from "~/lib/hooks";
import TagGroup from "./tags/TagGroup";

export interface TitlePageProps {
  title: string;
  tags?: Tag[];
  children: React.ReactNode;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  withDivider?: boolean;
  onButtonClick?: () => void;
}

export default function TitlePage({
  title,
  tags,
  children,
  buttonText,
  buttonIcon,
  withDivider = true,
  onButtonClick,
}: TitlePageProps) {
  const desktopOnly = useDesktopOnly();

  return (
    <Flex h="calc(100dvh - 60px)" direction="column" p="md">
      <Flex
        mih={60}
        direction="row"
        justify="space-between"
        wrap="nowrap"
        align="center"
        mb="xs"
      >
        <Stack h="100%" gap="xs" justify="center">
          {tags && <TagGroup tags={tags} groupProps={{ justify: "start" }} />}
          <Title order={2}>{title}</Title>
        </Stack>
        {buttonText &&
          (desktopOnly ? (
            <Button
              h={40}
              rightSection={buttonIcon}
              onClick={onButtonClick}
              disabled={!onButtonClick}
            >
              {buttonText}
            </Button>
          ) : (
            <ActionIcon
              size={40}
              onClick={onButtonClick}
              disabled={!onButtonClick}
            >
              {buttonIcon}
            </ActionIcon>
          ))}
      </Flex>
      {withDivider && <Divider w="100%" mb="xs" />}
      {children}
    </Flex>
  );
}
