import { ActionIcon, Box, Button, Divider, Flex, Stack, Title } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useDesktopOnly } from "~/lib/hooks";

export interface TitlePageProps {
    title: string;
    topSection?: React.ReactNode;
    bottomSection?: React.ReactNode;
    children: React.ReactNode;
    buttonText?: string;
    buttonIcon?: React.ReactNode;
    withDivider?: boolean;
    onButtonClick?: () => void;
}

export default function TitlePage({
    title,
    topSection,
    bottomSection,
    children,
    buttonText,
    buttonIcon,
    withDivider = true,
    onButtonClick,
}: TitlePageProps) {
    const desktopOnly = useDesktopOnly();
    const { ref: titleRef, height: titleHeight } = useElementSize();

    const titleElement = (
        <Flex
            direction="row"
            justify="space-between"
            wrap="nowrap"
            align="center"
            mb="xs"
            ref={titleRef}
        >
            <Stack h="100%" mah={100} gap={2} justify="center">
                {topSection}
                <Title order={2}>{title}</Title>
                {bottomSection}
            </Stack>
            {buttonText && (
                <>
                    <Button
                        h={40}
                        rightSection={buttonIcon}
                        onClick={onButtonClick}
                        disabled={!onButtonClick}
                        visibleFrom="xs"
                    >
                        {buttonText}
                    </Button>
                    <ActionIcon
                        size={40}
                        onClick={onButtonClick}
                        disabled={!onButtonClick}
                        hiddenFrom="xs"
                    >
                        {buttonIcon}
                    </ActionIcon>
                </>
            )}
        </Flex>
    );

    return (
        <Flex
            mih={500}
            {...(desktopOnly === true && { h: "calc(100dvh - 60px)" })}
            direction="column"
            p="md"
        >
            {titleElement}
            {withDivider && <Divider w="100%" mb="xs" />}
            <Box w="100%" h={`calc(100% - ${titleHeight + 10}px`}>
                {children}
            </Box>
        </Flex>
    );
}
