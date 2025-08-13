import { Divider, Flex, MantineStyleProp, Stack, Title } from "@mantine/core";

export interface TitlePageProps {
    title: string;
    topSection?: React.ReactNode;
    bottomSection?: React.ReactNode;
    rightSection?: React.ReactNode;
    withDivider?: boolean;
    style?: MantineStyleProp;
}

export default function TitlePage({
    title,
    topSection,
    bottomSection,
    rightSection,
    withDivider = true,
    style,
}: TitlePageProps) {
    const titleElement = (
        <Flex direction="row" justify="space-between" wrap="nowrap" align="center" p="sm">
            <Stack h="100%" mah={100} gap={2} justify="center">
                {topSection}
                <Title order={2}>{title}</Title>
                {bottomSection}
            </Stack>
            {rightSection}
        </Flex>
    );

    return (
        <>
            {titleElement}
            {withDivider && <Divider w="100%" />}
        </>
    );
}
