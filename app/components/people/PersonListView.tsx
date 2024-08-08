import { Badge, Flex, Group, Highlight, Space, Text, Title, UnstyledButton } from "@mantine/core";
import { PersonRole, Tag } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { IconChevronRight, IconInfoCircle } from "@tabler/icons-react";
import { formatFullName } from "~/utils/utils";

export interface PersonListViewProps {
    id: number;
    firstName: string;
    lastName: string;
    nickname?: string | null;
    role?: PersonRole;
    tags?: Tag[];
    totalLoans?: number;
    outstandingLoans?: number;
    query?: string;
    qrCode?: string;
    showChevron?: boolean;
    invalidItems?: {
        id: number;
        name: string;
        status: Tag;
    }[];
}

export default function PersonListView({
    id,
    firstName,
    lastName,
    nickname,
    role,
    tags = [],
    totalLoans,
    outstandingLoans,
    query,
    qrCode,
    showChevron = true,
    invalidItems,
}: PersonListViewProps) {
    const navigate = useNavigate();
    const fullName = formatFullName({
        firstName: firstName,
        lastName: lastName,
        nickname: nickname,
    });

    return (
        <UnstyledButton
            className="list-item"
            w="100%"
            h="100%"
            onClick={() => navigate(`/people/${id}`)}
        >
            <Flex p="xs" direction="row" align="center" justify="space-between">
                <Flex w="100%" direction="column" mr="lg">
                    <Group w="100%">
                        {invalidItems && invalidItems.length > 0 && <IconInfoCircle color="red" />}
                        <Highlight
                            component={Title}
                            order={4}
                            c={invalidItems && invalidItems.length > 0 ? "red" : undefined}
                            highlight={qrCode ? fullName : query ? query.split(" ") : ""}
                        >
                            {fullName}
                        </Highlight>
                    </Group>
                    {role && (
                        <Badge color={role.color} variant="dot" autoContrast>
                            {role.name}
                        </Badge>
                    )}
                    <Space h="xs" />

                    <Text size="xs">
                        {totalLoans} Total Loans{" "}
                        {outstandingLoans ? (
                            <>
                                <Text span inherit c="red" fw="bold">
                                    ({outstandingLoans} Outstanding)
                                </Text>
                            </>
                        ) : undefined}
                    </Text>
                    {invalidItems && invalidItems.length > 0 && (
                        <>
                            <Space h="xs" />
                            {invalidItems.map((item) => (
                                <Text key={item.id} size="xs">
                                    {item.name} - {item.status.name}
                                </Text>
                            ))}
                        </>
                    )}
                </Flex>
                {showChevron && <IconChevronRight />}
            </Flex>
        </UnstyledButton>
    );
}
