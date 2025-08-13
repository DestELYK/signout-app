import {
    Box,
    Card,
    CardProps,
    CardSectionProps,
    Collapse,
    Flex,
    MantineStyleProps,
    Text,
} from "@mantine/core";
import { Link } from "@remix-run/react";

export interface InfoViewProps {
    title?: string;
    titleProps?: MantineStyleProps;
    href?: string;
    loading?: boolean;
    collapseOpen?: boolean;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
    collapseSection?: React.ReactNode;
    bottomSection?: React.ReactNode;
    cardProps?: CardProps;
    headerProps?: CardSectionProps;
    children: React.ReactNode;
}

export default function InfoView({
    title,
    titleProps,
    href,
    loading,
    collapseOpen = false,
    leftSection,
    rightSection,
    collapseSection,
    bottomSection,
    cardProps,
    headerProps,
    children,
}: InfoViewProps) {
    return (
        <Card w="100%" h="100%" withBorder {...cardProps}>
            {/* Header */}
            {title && (
                <Card.Section inheritPadding withBorder px="sm" {...headerProps}>
                    <Flex
                        direction="row"
                        align="center"
                        wrap="nowrap"
                        justify="space-between"
                        gap="xs"
                        py="sm"
                    >
                        <Flex direction="row" align="center" gap="xs" wrap="nowrap" justify="start">
                            {leftSection}
                            {href ? (
                                <Link to={href}>
                                    <Text fw="bold" size="md" aria-label={title} {...titleProps}>
                                        {title}
                                    </Text>
                                </Link>
                            ) : (
                                <Text fw="bold" size="md" aria-label={title} {...titleProps}>
                                    {title}
                                </Text>
                            )}
                        </Flex>
                        <Flex direction="row" align="center" gap="xs" wrap="nowrap" justify="end">
                            {rightSection}
                        </Flex>
                    </Flex>
                    {collapseSection && (
                        <Collapse in={collapseOpen} pb="sm">
                            {collapseSection}
                        </Collapse>
                    )}
                </Card.Section>
            )}
            <Box w="100%" h="100%" style={{ overflow: "hidden" }}>
                {children}
            </Box>
            {bottomSection !== undefined && (
                <Card.Section inheritPadding mt="auto" p="sm" withBorder>
                    {bottomSection}
                </Card.Section>
            )}
        </Card>
    );
}
